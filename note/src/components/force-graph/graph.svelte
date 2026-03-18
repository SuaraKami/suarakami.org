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
    centerForce: 0.2,
    collisionPadding: 6,
    drag: true,
    focusOnHover: true,
    fontSize: 1,
    linkDistance: 110,
    opacityScale: 1.3,
    radial: false,
    radialStrength: 0.18,
    repelForce: 1,
    scale: 2.6,
    zoom: true,
  }

  const sampleGraph: ForceGraphData = {
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
  }

  let lastGraphData: ForceGraphData | null = null
  let lastNormalized: NormalizedGraph | null = null

  interface Props {
    graphData?: ForceGraphData
    config?: ForceGraphConfig
    activeNodeId?: string | null
    onSelect?: (payload: GraphSelectionPayload) => void
  }

  const {
    graphData = sampleGraph,
    config = {},
    activeNodeId = null,
    onSelect = (() => {
      // no-op
    }) as (payload: GraphSelectionPayload) => void,
  }: Props = $props()

  let stageEl = $state<HTMLDivElement | null>(null)
  let hasRenderableGraph = $state(Boolean(graphData?.nodes?.length))

  function normalizeGraphData(data: ForceGraphData): NormalizedGraph {
    const nodes: NormalizedNode[] = data.nodes.map(node => ({
      id: node.id,
      kind: node.kind ?? (node.id.startsWith('tag:') ? 'tag' : 'page'),
      label: node.label ?? node.id,
      slug: node.slug,
      tags: node.tags ?? [],
    }))

    const validIds = new Set(nodes.map(node => node.id))
    const links: NormalizedLink[] = data.links
      .filter(link => validIds.has(link.source) && validIds.has(link.target))
      .map(link => ({ source: link.source, target: link.target }))

    return { links, nodes }
  }

  function getNormalizedGraph(data: ForceGraphData): NormalizedGraph {
    if (data === lastGraphData && lastNormalized) {
      return lastNormalized
    }
    const normalized = normalizeGraphData(data)
    lastGraphData = data
    lastNormalized = normalized
    return normalized
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

  function getNodeColor(
    node: NormalizedNode,
    palette: GraphPalette,
    selectedId: string | null,
  ) {
    if (node.id === selectedId)
      {return palette.current}
    if (node.kind === 'tag')
      {return palette.tagFill}
    return palette.neutral
  }

  function drawNode(
    gfx: Graphics,
    radius: number,
    palette: GraphPalette,
    node: NormalizedNode,
    selectedId: string | null,
  ) {
    gfx.clear()
    const fill = getNodeColor(node, palette, selectedId)
    gfx.circle(0, 0, radius)
    gfx.fill({ color: fill })
    if (node.kind === 'tag') {
      gfx.stroke({ color: palette.tagBorder, width: 2 })
    }
    gfx.hitArea = new Circle(0, 0, radius + 8)
  }

  function readPalette(): GraphPalette {
    const styles = getComputedStyle(document.documentElement)
    const fallback = (key: string, value: string) =>
      styles.getPropertyValue(key)?.trim() || value
    return {
      current: fallback('--accent-primary', '#9b87ff'),
      fontFamily: fallback('--font-sans', 'Inter, sans-serif'),
      lines: 'rgba(255,255,255,0.15)',
      linesHighlight: fallback('--accent-link', '#b2f5ff'),
      neutral: fallback('--text-muted', '#697e93'),
      tagBorder: fallback('--border', '#30363d'),
      tagFill: fallback('--accent-link', '#7dd3fc'),
      text: fallback('--text-main', '#f1f5f9'),
    }
  }

  function extractSelection(node: NormalizedNode): GraphSelectionPayload {
    return {
      id: node.id,
      label: node.label,
      slug: node.slug,
      tags: node.tags,
    }
  }

  async function renderGraph(host: HTMLElement, options: RenderOptions) {
    const { data, config: renderConfig, activeNodeId: renderActiveId, onNodeSelect } = options

    const width = host.clientWidth || host.offsetWidth || 640
    const height = Math.max(host.clientHeight || host.offsetHeight || 320, 320)

    host.replaceChildren()

    const app = new Application()
    await app.init({
      antialias: true,
      autoDensity: true,
      backgroundAlpha: 0,
      eventMode: 'static',
      height,
      resolution: window.devicePixelRatio || 1,
      width,
    })
    host.append(app.canvas)

    const {stage} = app
    stage.interactive = false
    stage.sortableChildren = true

    const palette = readPalette()

    const tweens = new Map<string, TweenHandle>()
    const linkContainer = new Container<Graphics>({
      isRenderGroup: true,
      zIndex: 1,
    })
    const nodeContainer = new Container<Graphics>({
      isRenderGroup: true,
      zIndex: 2,
    })
    const labelContainer = new Container<Text>({
      isRenderGroup: true,
      zIndex: 3,
    })
    stage.addChild(linkContainer, nodeContainer, labelContainer)

    const {nodes} = data
    const {links} = data
    const degreeMap = computeDegreeMap(links)

    const nodeRenderData: NodeRenderData[] = []
    const linkRenderData: LinkRenderData[] = []
    let hoveredNode: NormalizedNode | null = null
    let dragStartTime = 0
    let dragging = false
    let currentTransform = zoomIdentity
    let labelBaseOpacity = 0

    function startTween(key: string, group: TweenGroup) {
      for (const tween of group.getAll()) { tween.start() }
      tweens.set(key, {
        stop: () => { for (const tween of group.getAll()) { tween.stop() } },
        update: group.update.bind(group),
      })
    }

    function renderNodes(tweenGroup: TweenGroup) {
      for (const renderNode of nodeRenderData) {
        const shouldDim = Boolean(hoveredNode && renderConfig.focusOnHover)
        let targetAlpha = 1
        if (shouldDim) {
          targetAlpha = renderNode.active ? 1 : 0.25
        }
        tweenGroup.add(
          new Tweened(renderNode.gfx, tweenGroup).to({ alpha: targetAlpha }, 160),
        )
      }
    }

    function renderLinks(tweenGroup: TweenGroup) {
      for (const link of linkRenderData) {
        let alpha = 0.8
        if (hoveredNode) {
          alpha = link.active ? 1 : 0.2
        }
        link.color = link.active ? palette.linesHighlight : palette.lines
        tweenGroup.add(new Tweened(link, tweenGroup).to({ alpha }, 160))
      }
    }

    function renderLabels(tweenGroup: TweenGroup) {
      const defaultScale = 1 / renderConfig.scale
      const activeScale = defaultScale * 1.1
      for (const renderNode of nodeRenderData) {
        const isHovered = hoveredNode?.id === renderNode.simulationData.id
        const targetAlpha = isHovered ? 1 : labelBaseOpacity
        tweenGroup.add(
          new Tweened(renderNode.label, tweenGroup).to(
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

    function updateHover(targetNode: NormalizedNode | null, reRender = false) {
      hoveredNode = targetNode

      if (!hoveredNode) {
        for (const n of nodeRenderData) { n.active = false }
        for (const link of linkRenderData) { link.active = false }
        if (reRender && !dragging)
          {renderInteraction()}
        return
      }

      const neighbours = new Set<string>()
      for (const link of linkRenderData) {
        const source = link.simulationData.source as NormalizedNode
        const target = link.simulationData.target as NormalizedNode
        const isNeighbour
          = source.id === hoveredNode.id || target.id === hoveredNode.id
        link.active = isNeighbour
        if (isNeighbour) {
          neighbours.add(source.id)
          neighbours.add(target.id)
        }
      }

      for (const n of nodeRenderData) {
        n.active = neighbours.has(n.simulationData.id)
      }
      if (reRender && !dragging) {
        renderInteraction()
      }
    }

    const simulation: Simulation<NormalizedNode, NormalizedLink>
      = forceSimulation<NormalizedNode>(nodes)
        .force('charge', forceManyBody().strength(-100 * renderConfig.repelForce))
        .force('center', forceCenter().strength(renderConfig.centerForce))
        .force(
          'link',
          forceLink<NormalizedNode, NormalizedLink>(links)
            .id(d => d.id)
            .distance(renderConfig.linkDistance),
        )
        .force(
          'collide',
          forceCollide<NormalizedNode>(
            n => nodeRadius(n, degreeMap) + renderConfig.collisionPadding,
          ).iterations(3),
        )

    if (renderConfig.radial) {
      simulation.force(
        'radial',
        forceRadial(Math.min(width, height) * 0.4).strength(
          renderConfig.radialStrength,
        ),
      )
    }

    for (const node of nodes) {
      const radius = nodeRadius(node, degreeMap)
      const label = new Text({
        alpha: 0,
        anchor: { x: 0.5, y: 2 },
        resolution: (window.devicePixelRatio || 1) * 3,
        style: {
          fill: palette.text,
          fontFamily: palette.fontFamily,
          fontSize: renderConfig.fontSize * 16,
        },
        text: node.label,
      })
      label.scale.set(1 / renderConfig.scale)

      const gfx = new Graphics({
        cursor: 'pointer',
        eventMode: 'static',
        hitArea: new Circle(0, 0, radius + 8),
      })

      drawNode(gfx, radius, palette, node, renderActiveId)

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
        active: false,
        gfx,
        label,
        simulationData: node,
      })
    }

    for (const link of links) {
      const gfx = new Graphics({ eventMode: 'none' })
      linkContainer.addChild(gfx)
      linkRenderData.push({
        active: false,
        alpha: 1,
        color: palette.lines,
        gfx,
        simulationData: link,
      })
    }

    type DragDatum = NormalizedNode | undefined
    const canvasSelection = select<HTMLCanvasElement, DragDatum>(app.canvas)

    if (renderConfig.drag) {
      canvasSelection.call(
        drag<HTMLCanvasElement, DragDatum>()
          .container(() => app.canvas)
          .subject(() => hoveredNode ?? undefined)
          .on('start', (event) => {
            if (!event.active)
              {simulation.alphaTarget(1).restart()}
            event.subject.fx = event.subject.x ?? 0
            event.subject.fy = event.subject.y ?? 0
            event.subject.__initialDragPos = {
              fx: event.subject.fx,
              fy: event.subject.fy,
              x: event.subject.x ?? 0,
              y: event.subject.y ?? 0,
            }
            dragStartTime = Date.now()
            dragging = true
          })
          .on('drag', (event) => {
            const initPos = event.subject.__initialDragPos
            if (!initPos)
              {return}
            event.subject.fx
              = initPos.x + (event.x - initPos.x) / currentTransform.k
            event.subject.fy
              = initPos.y + (event.y - initPos.y) / currentTransform.k
          })
          .on('end', (event) => {
            if (!event.active)
              {simulation.alphaTarget(0)}
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
      for (const renderNode of nodeRenderData) {
        renderNode.gfx.on('pointertap', () => {
          onNodeSelect(extractSelection(renderNode.simulationData))
        })
      }
    }

    if (renderConfig.zoom) {
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

            const scale = event.transform.k * renderConfig.opacityScale
            labelBaseOpacity = Math.max((scale - 1) / 3.75, 0)
            renderInteraction()
          }),
      )
    }

    let stopAnimation = false
    let frameRef: number | null = null

    function animate(time: number) {
      if (stopAnimation)
        {return}

      for (const renderNode of nodeRenderData) {
        const { x, y } = renderNode.simulationData
        if (x === null || x === undefined || y === null || y === undefined)
          {continue}
        const posX = x + width / 2
        const posY = y + height / 2
        renderNode.gfx.position.set(posX, posY)
        renderNode.label.position.set(posX, posY)
      }

      for (const link of linkRenderData) {
        const source = link.simulationData.source as NormalizedNode
        const target = link.simulationData.target as NormalizedNode
        if (!source || !target)
          {continue}
        link.gfx.clear()
        link.gfx.moveTo(
          (source.x ?? 0) + width / 2,
          (source.y ?? 0) + height / 2,
        )
        link.gfx
          .lineTo((target.x ?? 0) + width / 2, (target.y ?? 0) + height / 2)
          .stroke({ alpha: link.alpha, color: link.color, width: 1 })
      }

      for (const tween of tweens.values()) { tween.update(time) }
      app.renderer.render(stage)
      frameRef = requestAnimationFrame(animate)
    }

    frameRef = requestAnimationFrame(animate)

    return () => {
      stopAnimation = true
      if (frameRef)
        {cancelAnimationFrame(frameRef)}
      for (const tween of tweens.values()) { tween.stop() }
      tweens.clear()
      simulation.stop()
      canvasSelection.on('.drag', null)
      canvasSelection.on('.zoom', null)
      app.destroy(true, { children: true })
      host.replaceChildren()
    }
  }

  $effect(() => {
    if (!stageEl || typeof window === 'undefined')
      {return}

    const normalized = getNormalizedGraph(graphData)
    const mergedConfig = { ...defaultGraphConfig, ...config }
    hasRenderableGraph = normalized.nodes.length > 0
    if (!hasRenderableGraph) {
      stageEl.replaceChildren()
      return
    }

    let disposed = false
    let localCleanup: (() => void) | null = null;

    (async () => {
      localCleanup = await renderGraph(stageEl, {
        activeNodeId,
        config: mergedConfig,
        data: normalized,
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
</script>

<div class='relative size-full overflow-hidden'>
  <div class='pointer-events-none absolute inset-0' aria-hidden='true'></div>
  <div class='absolute inset-0' bind:this={stageEl}></div>
  {#if !hasRenderableGraph}
    <div
      class='absolute inset-0 grid place-items-center text-sm text-foreground-muted'
    >
      No graph data.
    </div>
  {/if}
</div>