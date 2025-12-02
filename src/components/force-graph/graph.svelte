<script lang='ts'>
  import type { Simulation } from 'd3'
  import type {
    ForceGraphConfig,
    ForceGraphData,
    GraphLink,
    GraphPalette,
    GraphSelectionPayload,
    LinkRenderData,
    NodeRenderData,
    NormalizedGraph,
    NormalizedLink,
    NormalizedNode,
    RenderOptions,
    TweenHandle,
  } from './types'
  import { Tween as Tweened, Group as TweenGroup } from '@tweenjs/tween.js'
  import {
    drag,
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceRadial,
    forceSimulation,
    select,
    zoom,
    zoomIdentity,
  } from 'd3'
  import { Application, Circle, Container, Graphics, Text } from 'pixi.js'

  const defaultGraphConfig: Required<ForceGraphConfig> = {
    drag: true,
    zoom: true,
    linkDistance: 110,
    repelForce: 1,
    centerForce: 0.2,
    collisionPadding: 6,
    fontSize: 1,
    opacityScale: 1.3,
    focusOnHover: true,
    radial: false,
    radialStrength: 0.18,
    scale: 2.6,
  }

  const sampleGraph: ForceGraphData = {
    nodes: [
      { id: 'configuration', label: 'Configuration' },
      { id: 'editor', label: 'Editor Setup' },
      { id: 'synchronization', label: 'Sync' },
      { id: 'deploy', label: 'Deployment' },
      { id: 'design-system', label: 'Design System' },
      { id: 'glossary', label: 'Glossary' },
      { id: 'linting', label: 'Linting' },
      { id: 'state', label: 'State Layer' },
      { id: 'themes', label: 'Themes' },
      { id: 'shortcuts', label: 'Shortcuts' },
    ],
    links: [
      { source: 'configuration', target: 'editor' },
      { source: 'configuration', target: 'synchronization' },
      { source: 'configuration', target: 'deploy' },
      { source: 'configuration', target: 'state' },
      { source: 'editor', target: 'linting' },
      { source: 'linting', target: 'glossary' },
      { source: 'design-system', target: 'themes' },
      { source: 'design-system', target: 'glossary' },
      { source: 'deploy', target: 'shortcuts' },
      { source: 'glossary', target: 'shortcuts' },
      { source: 'state', target: 'design-system' },
      { source: 'themes', target: 'synchronization' },
    ],
  }

  let lastGraphData: ForceGraphData | null = null
  let lastNormalized: NormalizedGraph | null = null

  const {
    graphData = sampleGraph,
    config = {},
    activeNodeId = null,
    onSelect = (() => {}) as (payload: GraphSelectionPayload) => void,
  } = $props<{
    graphData?: ForceGraphData
    config?: ForceGraphConfig
    activeNodeId?: string | null
    onSelect?: (payload: GraphSelectionPayload) => void
  }>()

  let stageEl = $state<HTMLDivElement | null>(null)
  let hasRenderableGraph = $state(Boolean(graphData?.nodes?.length))

  $effect(() => {
    if (!stageEl || typeof window === 'undefined')
      return

    const normalized = getNormalizedGraph(graphData)
    const mergedConfig = { ...defaultGraphConfig, ...config }
    hasRenderableGraph = normalized.nodes.length > 0
    if (!hasRenderableGraph) {
      stageEl.replaceChildren()
      return
    }

    let disposed = false
    let localCleanup: (() => void) | null = null

    ;(async () => {
      localCleanup = await renderGraph(stageEl, {
        data: normalized,
        config: mergedConfig,
        activeNodeId,
        onNodeSelect: onSelect,
      })
      if (disposed) {
        localCleanup?.()
      }
    })()

    return () => {
      disposed = true
      localCleanup?.()
    }
  })

  function getNormalizedGraph(data: ForceGraphData): NormalizedGraph {
    if (data === lastGraphData && lastNormalized) {
      return lastNormalized
    }
    const normalized = normalizeGraphData(data)
    lastGraphData = data
    lastNormalized = normalized
    return normalized
  }

  function normalizeGraphData(data: ForceGraphData): NormalizedGraph {
    const nodes: NormalizedNode[] = data.nodes.map(node => ({
      id: node.id,
      label: node.label ?? node.id,
      tags: node.tags ?? [],
      slug: node.slug,
      kind: node.kind ?? (node.id.startsWith('tag:') ? 'tag' : 'page'),
    }))

    const validIds = new Set(nodes.map(node => node.id))
    const links: NormalizedLink[] = data.links
      .filter(link => validIds.has(link.source) && validIds.has(link.target))
      .map(link => ({ source: link.source, target: link.target }))

    return { nodes, links }
  }

  async function renderGraph(host: HTMLElement, options: RenderOptions) {
    const { data, config, activeNodeId, onNodeSelect } = options

    const width = host.clientWidth || host.offsetWidth || 640
    const height = Math.max(host.clientHeight || host.offsetHeight || 320, 320)

    host.replaceChildren()

    const app = new Application()
    await app.init({
      width,
      height,
      antialias: true,
      autoDensity: true,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      eventMode: 'static',
    })
    host.appendChild(app.canvas)

    const stage = app.stage
    stage.interactive = false
    stage.sortableChildren = true

    const palette = readPalette()

    const tweens = new Map<string, TweenHandle>()
    const linkContainer = new Container<Graphics>({ zIndex: 1, isRenderGroup: true })
    const nodeContainer = new Container<Graphics>({ zIndex: 2, isRenderGroup: true })
    const labelContainer = new Container<Text>({ zIndex: 3, isRenderGroup: true })
    stage.addChild(linkContainer, nodeContainer, labelContainer)

    const nodes = data.nodes
    const links = data.links
    const degreeMap = computeDegreeMap(links)

    const nodeRenderData: NodeRenderData[] = []
    const linkRenderData: LinkRenderData[] = []
    let hoveredNode: NormalizedNode | null = null
    let dragStartTime = 0
    let dragging = false
    let currentTransform = zoomIdentity
    let labelBaseOpacity = 0

    const simulation: Simulation<NormalizedNode, NormalizedLink> = forceSimulation<NormalizedNode>(nodes)
      .force('charge', forceManyBody().strength(-100 * config.repelForce))
      .force('center', forceCenter().strength(config.centerForce))
      .force('link', forceLink<NormalizedNode, NormalizedLink>(links).id(d => d.id).distance(config.linkDistance))
      .force('collide', forceCollide<NormalizedNode>(node => nodeRadius(node, degreeMap) + config.collisionPadding).iterations(3))

    if (config.radial) {
      simulation.force('radial', forceRadial(Math.min(width, height) * 0.4).strength(config.radialStrength))
    }

    for (const node of nodes) {
      const radius = nodeRadius(node, degreeMap)
      const label = new Text({
        text: node.label,
        alpha: 0,
        anchor: { x: 0.5, y: 2 },
        style: {
          fontSize: config.fontSize * 16,
          fill: palette.text,
          fontFamily: palette.fontFamily,
        },
        resolution: (window.devicePixelRatio || 1) * 3,
      })
      label.scale.set(1 / config.scale)

      const gfx = new Graphics({
        eventMode: 'static',
        cursor: 'pointer',
        hitArea: new Circle(0, 0, radius + 8),
      })

      drawNode(gfx, radius, palette, node, activeNodeId)

      gfx
        .on('pointerover', () => {
          updateHover(node, true)
        })
        .on('pointerleave', () => {
          updateHover(null, true)
        })

      nodeContainer.addChild(gfx)
      labelContainer.addChild(label)

      nodeRenderData.push({
        simulationData: node,
        gfx,
        label,
        active: false,
      })
    }

    for (const link of links) {
      const gfx = new Graphics({ eventMode: 'none' })
      linkContainer.addChild(gfx)
      linkRenderData.push({
        simulationData: link,
        gfx,
        color: palette.lines,
        alpha: 1,
        active: false,
      })
    }

    function updateHover(node: NormalizedNode | null, reRender = false) {
      hoveredNode = node

      if (!hoveredNode) {
        nodeRenderData.forEach(node => (node.active = false))
        linkRenderData.forEach(link => (link.active = false))
        if (reRender && !dragging)
          renderInteraction()
        return
      }

      const neighbours = new Set<string>()
      for (const link of linkRenderData) {
        const source = link.simulationData.source as NormalizedNode
        const target = link.simulationData.target as NormalizedNode
        const isNeighbour = source.id === hoveredNode.id || target.id === hoveredNode.id
        link.active = isNeighbour
        if (isNeighbour) {
          neighbours.add(source.id)
          neighbours.add(target.id)
        }
      }

      for (const node of nodeRenderData) {
        node.active = neighbours.has(node.simulationData.id)
      }
      if (reRender && !dragging) {
        renderInteraction()
      }
    }

    function renderNodes(tweenGroup: TweenGroup) {
      for (const node of nodeRenderData) {
        const shouldDim = Boolean(hoveredNode && config.focusOnHover)
        const targetAlpha = shouldDim ? (node.active ? 1 : 0.25) : 1
        tweenGroup.add(new Tweened(node.gfx, tweenGroup).to({ alpha: targetAlpha }, 160))
      }
    }

    function renderLinks(tweenGroup: TweenGroup) {
      for (const link of linkRenderData) {
        const alpha = hoveredNode ? (link.active ? 1 : 0.2) : 0.8
        link.color = link.active ? palette.linesHighlight : palette.lines
        tweenGroup.add(new Tweened(link, tweenGroup).to({ alpha }, 160))
      }
    }

    function renderLabels(tweenGroup: TweenGroup) {
      const defaultScale = 1 / config.scale
      const activeScale = defaultScale * 1.1
      for (const node of nodeRenderData) {
        const isHovered = hoveredNode?.id === node.simulationData.id
        const targetAlpha = isHovered ? 1 : labelBaseOpacity
        tweenGroup.add(
          new Tweened(node.label, tweenGroup).to(
            {
              alpha: targetAlpha,
              scale: {
                x: isHovered ? activeScale : defaultScale,
                y: isHovered ? activeScale : defaultScale,
              },
            },
            120,
          ),
        )
      }
    }

    function renderInteraction() {
      tweens.get('interaction')?.stop()
      const tweenGroup = new TweenGroup()
      renderNodes(tweenGroup)
      renderLinks(tweenGroup)
      renderLabels(tweenGroup)
      startTween('interaction', tweenGroup)
    }

    function startTween(key: string, group: TweenGroup) {
      group.getAll().forEach(tween => tween.start())
      tweens.set(key, {
        update: group.update.bind(group),
        stop: () => group.getAll().forEach(tween => tween.stop()),
      })
    }

    type DragDatum = NormalizedNode | undefined
    const canvasSelection = select<HTMLCanvasElement, DragDatum>(app.canvas)

    if (config.drag) {
      canvasSelection.call(
        drag<HTMLCanvasElement, DragDatum>()
          .container(() => app.canvas)
          .subject(() => hoveredNode ?? undefined)
          .on('start', (event) => {
            if (!event.active)
              simulation.alphaTarget(1).restart()
            event.subject.fx = event.subject.x ?? 0
            event.subject.fy = event.subject.y ?? 0
            event.subject.__initialDragPos = {
              x: event.subject.x ?? 0,
              y: event.subject.y ?? 0,
              fx: event.subject.fx,
              fy: event.subject.fy,
            }
            dragStartTime = Date.now()
            dragging = true
          })
          .on('drag', (event) => {
            const initPos = event.subject.__initialDragPos
            if (!initPos)
              return
            event.subject.fx = initPos.x + (event.x - initPos.x) / currentTransform.k
            event.subject.fy = initPos.y + (event.y - initPos.y) / currentTransform.k
          })
          .on('end', (event) => {
            if (!event.active)
              simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
            dragging = false

            if (Date.now() - dragStartTime < 300) {
              onNodeSelect(extractSelection(event.subject))
            }
            updateHover(null, true)
          }),
      )
    }
    else {
      for (const node of nodeRenderData) {
        node.gfx.on('pointertap', () => {
          onNodeSelect(extractSelection(node.simulationData))
        })
      }
    }

    if (config.zoom) {
      canvasSelection.call(
        zoom<HTMLCanvasElement, DragDatum>()
          .extent([
            [0, 0],
            [width, height],
          ])
          .scaleExtent([0.25, 4])
          .on('zoom', (event) => {
            currentTransform = event.transform
            stage.scale.set(event.transform.k, event.transform.k)
            stage.position.set(event.transform.x, event.transform.y)

            const scale = event.transform.k * config.opacityScale
            labelBaseOpacity = Math.max((scale - 1) / 3.75, 0)
            renderInteraction()
          }),
      )
    }

    let stopAnimation = false
    let frameRef: number | null = null

    function animate(time: number) {
      if (stopAnimation)
        return

      for (const node of nodeRenderData) {
        const { x, y } = node.simulationData
        if (x == null || y == null)
          continue
        const posX = x + width / 2
        const posY = y + height / 2
        node.gfx.position.set(posX, posY)
        node.label.position.set(posX, posY)
      }

      for (const link of linkRenderData) {
        const source = link.simulationData.source as NormalizedNode
        const target = link.simulationData.target as NormalizedNode
        if (!source || !target)
          continue
        link.gfx.clear()
        link.gfx.moveTo((source.x ?? 0) + width / 2, (source.y ?? 0) + height / 2)
        link.gfx
          .lineTo((target.x ?? 0) + width / 2, (target.y ?? 0) + height / 2)
          .stroke({ width: 1, alpha: link.alpha, color: link.color })
      }

      tweens.forEach(tween => tween.update(time))
      app.renderer.render(stage)
      frameRef = requestAnimationFrame(animate)
    }

    frameRef = requestAnimationFrame(animate)

    return () => {
      stopAnimation = true
      if (frameRef)
        cancelAnimationFrame(frameRef)
      tweens.forEach(tween => tween.stop())
      tweens.clear()
      simulation.stop()
      canvasSelection.on('.drag', null)
      canvasSelection.on('.zoom', null)
      app.destroy(true, { children: true })
      host.replaceChildren()
    }
  }

  function computeDegreeMap(links: GraphLink[]) {
    const degree = new Map<string, number>()
    for (const link of links) {
      degree.set(link.source, (degree.get(link.source) ?? 0) + 1)
      degree.set(link.target, (degree.get(link.target) ?? 0) + 1)
    }
    return degree
  }

  function nodeRadius(node: NormalizedNode, degreeMap: Map<string, number>) {
    const degree = degreeMap.get(node.id) ?? 1
    const base = node.kind === 'tag' ? 2 : 4
    return base + Math.sqrt(degree + 1) * 2.1
  }

  function drawNode(
    gfx: Graphics,
    radius: number,
    palette: GraphPalette,
    node: NormalizedNode,
    activeNodeId: string | null,
  ) {
    gfx.clear()
    const fill = getNodeColor(node, palette, activeNodeId)
    gfx.circle(0, 0, radius)
    gfx.fill({ color: fill })
    if (node.kind === 'tag') {
      gfx.stroke({ width: 2, color: palette.tagBorder })
    }
    gfx.hitArea = new Circle(0, 0, radius + 8)
  }

  function getNodeColor(
    node: NormalizedNode,
    palette: GraphPalette,
    activeNodeId: string | null,
  ) {
    if (node.id === activeNodeId)
      return palette.current
    if (node.kind === 'tag')
      return palette.tagFill
    return palette.neutral
  }

  function readPalette(): GraphPalette {
    const styles = getComputedStyle(document.documentElement)
    const fallback = (key: string, value: string) => styles.getPropertyValue(key)?.trim() || value
    return {
      current: fallback('--accent-primary', '#9b87ff'),
      tagFill: fallback('--accent-link', '#7dd3fc'),
      neutral: fallback('--text-muted', '#697e93'),
      lines: 'rgba(255,255,255,0.15)',
      linesHighlight: fallback('--accent-link', '#b2f5ff'),
      tagBorder: fallback('--border', '#30363d'),
      text: fallback('--text-main', '#f1f5f9'),
      fontFamily: fallback('--font-sans', 'Inter, sans-serif'),
    }
  }

  function extractSelection(node: NormalizedNode): GraphSelectionPayload {
    return {
      id: node.id,
      label: node.label,
      tags: node.tags,
      slug: node.slug,
    }
  }
</script>

<div class='relative size-full overflow-hidden'>
  <div class='pointer-events-none absolute inset-0' aria-hidden='true'></div>
  <div class='absolute inset-0' bind:this={stageEl}></div>
  {#if !hasRenderableGraph}
    <div class='absolute inset-0 grid place-items-center text-sm text-foreground-muted'>No graph data.</div>
  {/if}
</div>
