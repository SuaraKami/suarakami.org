<script lang='ts'>
  import type { Simulation } from 'd3'
  import {
    drag,
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceRadial,
    forceSimulation,
    rollup,
    scaleLinear,
    select,
    zoom,
    zoomIdentity,
  } from 'd3'
  import type {
    ForceGraphConfig,
    ForceGraphData,
    GraphPalette,
    GraphSelectHandler,
    GraphSelectionPayload,
    NormalizedGraph,
    NormalizedLink,
    NormalizedLinkEndpoint,
    NormalizedNode,
  } from './types'

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

  interface Props {
    graphData?: ForceGraphData
    config?: ForceGraphConfig
    activeNodeId?: string | null
    onSelect?: GraphSelectHandler
  }

  interface LocalGraphInstance {
    destroy: () => void
    setActiveNode: (id: string | null) => void
  }

  interface CreateGraphOptions {
    data: NormalizedGraph
    config: Required<ForceGraphConfig>
    onNodeSelect?: GraphSelectHandler
    isDisposed: () => boolean
  }

  const { graphData = { links: [], nodes: [] }, config = {}, activeNodeId = null, onSelect }: Props = $props()

  let hostEl = $state<HTMLDivElement | null>(null)
  let graphInstance = $state.raw<LocalGraphInstance | null>(null)
  const hasRenderableGraph = $derived(Boolean(graphData?.nodes?.length))

  function normalizeGraphData(data: ForceGraphData): NormalizedGraph {
    const nodes = data.nodes.map(node => ({
      id: node.id,
      kind: node.kind ?? (node.id.startsWith('tag:') ? 'tag' : 'page'),
      label: node.label ?? node.id,
      slug: node.slug,
      tags: node.tags ?? [],
    }))
    const validIds = new Set(nodes.map(node => node.id))
    const links: NormalizedLink[] = data.links
      .filter(link => validIds.has(link.source) && validIds.has(link.target))
      .map(link => ({ ...link }))
    return { links, nodes }
  }

  function endpointId(value: NormalizedLinkEndpoint) {
    return typeof value === 'string' ? value : value.id
  }

  function computeDegreeMap(links: NormalizedLink[]) {
    return rollup(
      links.flatMap(link => [endpointId(link.source), endpointId(link.target)]),
      ids => ids.length,
      id => id,
    )
  }

  function nodeRadius(node: NormalizedNode, degreeMap: ReadonlyMap<string, number>) {
    const degree = degreeMap.get(node.id) ?? 1
    return (node.kind === 'tag' ? 2 : 4) + Math.sqrt(degree + 1) * 2.1
  }

  function getNodeColor(node: NormalizedNode, palette: GraphPalette, selectedId: string | null) {
    if (node.id === selectedId) { return palette.current }
    if (node.kind === 'tag') { return palette.tagFill }
    return palette.neutral
  }

  function readPalette(): GraphPalette {
    const styles = getComputedStyle(document.documentElement)
    const fallback = (key: string, value: string) => styles.getPropertyValue(key)?.trim() || value
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
    return { id: node.id, label: node.label, slug: node.slug, tags: node.tags }
  }

  function getEndpointNode(value: NormalizedLinkEndpoint) {
    return typeof value === 'string' ? null : value
  }

  function centerInitialPositions(nodes: NormalizedNode[], width: number, height: number) {
    const centerX = width / 2
    const centerY = height / 2
    const angleStep = Math.PI * (3 - Math.sqrt(5))
    for (const [index, node] of nodes.entries()) {
      const radius = Math.sqrt(index) * 4
      const angle = index * angleStep
      node.x = centerX + Math.cos(angle) * radius
      node.y = centerY + Math.sin(angle) * radius
    }
  }

  function createGraph(host: HTMLElement, options: CreateGraphOptions): LocalGraphInstance | null {
    const { data, config: renderConfig, onNodeSelect, isDisposed } = options
    const width = host.clientWidth || host.offsetWidth || 640
    const height = Math.max(host.clientHeight || host.offsetHeight || 320, 320)
    host.replaceChildren()

    const svg = select(host).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('display', 'block')
      .style('overflow', 'visible')

    const root = svg.append('g')
    const linkLayer = root.append('g').attr('fill', 'none').attr('stroke-linecap', 'round')
    const nodeLayer = root.append('g')
    const labelLayer = root.append('g')
    const palette = readPalette()
    const degreeMap = computeDegreeMap(data.links)
    const nodes = data.nodes
    const links = data.links
    centerInitialPositions(nodes, width, height)
    const simulation: Simulation<NormalizedNode, NormalizedLink> = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-100 * renderConfig.repelForce))
      .force('center', forceCenter(width / 2, height / 2).strength(renderConfig.centerForce))
      .force('link', forceLink<NormalizedNode, NormalizedLink>(links).id(d => d.id).distance(renderConfig.linkDistance))
      .force('collide', forceCollide<NormalizedNode>(n => nodeRadius(n, degreeMap) + renderConfig.collisionPadding).iterations(3))

    if (renderConfig.radial) { simulation.force('radial', forceRadial(Math.min(width, height) * 0.4).strength(renderConfig.radialStrength)) }

    const linkSelection = linkLayer.selectAll('line').data(links).join('line').attr('stroke-width', 1).attr('stroke', palette.lines).attr('opacity', 0.8)
    const nodeSelection = nodeLayer.selectAll('circle').data(nodes).join('circle')
      .attr('r', d => nodeRadius(d, degreeMap))
      .attr('fill', d => getNodeColor(d, palette, null))
      .attr('stroke', d => d.kind === 'tag' ? palette.tagBorder : 'none')
      .attr('stroke-width', d => d.kind === 'tag' ? 2 : 0)
      .attr('cursor', 'pointer')
    nodeSelection.append('title').text(d => d.label)
    const labelSelection = labelLayer.selectAll('text').data(nodes).join('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.2em')
      .attr('font-family', palette.fontFamily)
      .attr('font-size', renderConfig.fontSize * 16)
      .attr('fill', palette.text)
      .attr('opacity', 0)
      .style('pointer-events', 'none')

    let currentTransform = zoomIdentity
    let hoveredNode: NormalizedNode | null = null
    let activeId = null as string | null
    const zoomProgressScale = scaleLinear().domain([1, 4.75]).range([0, 1]).clamp(true)

    function zoomProgress() {
      return zoomProgressScale(currentTransform.k * renderConfig.opacityScale)
    }

    function labelOpacity(node: NormalizedNode) {
      if (hoveredNode?.id === node.id) { return 1 }
      return zoomProgress()
    }

    function labelScale(node: NormalizedNode) {
      const baseScale = 1 / renderConfig.scale
      const hoverBoost = hoveredNode?.id === node.id ? 0.1 : 0
      return baseScale * (1 + (zoomProgress() * 0.05) + hoverBoost)
    }

    function updateLabels() {
      labelSelection
        .attr('opacity', d => labelOpacity(d))
        .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0}) scale(${labelScale(d)})`)
    }

    function updateStyles() {
      const hoveredIds = new Set<string>()
      let linkHover = false
      if (hoveredNode && renderConfig.focusOnHover) {
        for (const link of links) {
          const s = getEndpointNode(link.source)
          const t = getEndpointNode(link.target)
          if (!s || !t) { continue }
          if (s.id === hoveredNode.id || t.id === hoveredNode.id) {
            linkHover = true
            hoveredIds.add(s.id)
            hoveredIds.add(t.id)
          }
        }
      }
      linkSelection
        .attr('stroke', d => {
          if (hoveredNode && renderConfig.focusOnHover) {
            const source = getEndpointNode(d.source)
            const target = getEndpointNode(d.target)
            const isHover = !!source && !!target && (source.id === hoveredNode.id || target.id === hoveredNode.id)
            return isHover ? palette.linesHighlight : palette.lines
          }
          return palette.lines
        })
        .attr('opacity', d => {
          if (hoveredNode && renderConfig.focusOnHover) {
            const source = getEndpointNode(d.source)
            const target = getEndpointNode(d.target)
            const isHover = !!source && !!target && (source.id === hoveredNode.id || target.id === hoveredNode.id)
            return isHover ? 1 : 0.2
          }
          return 0.8
        })
      nodeSelection.attr('fill', d => getNodeColor(d, palette, activeId)).attr('opacity', d => {
        if (hoveredNode && renderConfig.focusOnHover && linkHover) {
          return hoveredIds.has(d.id) ? 1 : 0.25
        }
        return 1
      })
      updateLabels()
    }

    function updatePositions() {
      linkSelection
        .attr('x1', d => getEndpointNode(d.source)?.x ?? 0)
        .attr('y1', d => getEndpointNode(d.source)?.y ?? 0)
        .attr('x2', d => getEndpointNode(d.target)?.x ?? 0)
        .attr('y2', d => getEndpointNode(d.target)?.y ?? 0)
      nodeSelection.attr('cx', d => d.x ?? 0).attr('cy', d => d.y ?? 0)
      updateLabels()
    }

    nodeSelection.on('pointerover', (_, d) => { hoveredNode = d; updateStyles() }).on('pointerleave', () => { hoveredNode = null; updateStyles() }).on('click', (event, d) => {
      event.stopPropagation()
      onNodeSelect?.(extractSelection(d))
    })

    if (renderConfig.drag) {
      const dragBehavior = drag<SVGCircleElement, NormalizedNode>()
        .on('start', (event, d) => {
          if (!event.active) { simulation.alphaTarget(1).restart() }
          d.fx = d.x ?? 0
          d.fy = d.y ?? 0
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) { simulation.alphaTarget(0) }
          d.fx = null
          d.fy = null
        })
      nodeSelection.call(dragBehavior as never)
    }

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on('zoom', (event) => {
        currentTransform = event.transform
        root.attr('transform', event.transform.toString())
        updateLabels()
      })
    if (renderConfig.zoom) { svg.call(zoomBehavior) }

    simulation.on('tick', () => {
      if (isDisposed()) { return }
      updatePositions()
      updateStyles()
    })

    updatePositions()
    updateStyles()

    function setActiveNode(id: string | null) {
      activeId = id
      nodeSelection.attr('fill', d => getNodeColor(d, palette, activeId))
    }

    function destroy() {
      simulation.stop()
      svg.on('.zoom', null)
      nodeSelection.on('.drag', null).on('pointerover', null).on('pointerleave', null).on('click', null)
      host.replaceChildren()
    }

    return { destroy, setActiveNode }
  }

  $effect(() => {
    if (!hostEl || typeof window === 'undefined') { return }
    const normalized = normalizeGraphData(graphData)
    const mergedConfig = { ...defaultGraphConfig, ...config }
    if (!hasRenderableGraph) {
      hostEl.replaceChildren()
      graphInstance = null
      return
    }

    let disposed = false
    const instance = createGraph(hostEl, { config: mergedConfig, data: normalized, isDisposed: () => disposed, onNodeSelect: onSelect })
    if (!instance) { return }
    graphInstance = instance

    return () => {
      disposed = true
      instance.destroy()
      graphInstance = null
    }
  })

  $effect(() => {
    graphInstance?.setActiveNode(activeNodeId)
  })
</script>

<div class='relative size-full overflow-hidden'>
  <div class='pointer-events-none absolute inset-0' aria-hidden='true'></div>
  <div class='absolute inset-0' bind:this={hostEl}></div>
  {#if !hasRenderableGraph}
    <div class='absolute inset-0 grid place-items-center text-sm text-foreground-muted'>No graph data.</div>
  {/if}
</div>
