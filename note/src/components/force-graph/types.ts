import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3'
import type { Graphics, Text } from 'pixi.js'

export type GraphNodeKind = 'page' | 'tag'

export interface ForceGraphNode {
  id: string
  label?: string
  tags?: string[]
  slug?: string | null
  kind?: GraphNodeKind
}

export interface ForceGraphLink {
  source: string
  target: string
}

export interface ForceGraphData {
  nodes: ForceGraphNode[]
  links: ForceGraphLink[]
}

export interface ForceGraphConfig {
  drag?: boolean
  zoom?: boolean
  linkDistance?: number
  repelForce?: number
  centerForce?: number
  collisionPadding?: number
  fontSize?: number
  opacityScale?: number
  focusOnHover?: boolean
  radial?: boolean
  radialStrength?: number
  scale?: number
}

export interface GraphSelectionPayload {
  id: string
  label?: string
  tags?: string[]
  slug?: string | null
}

export interface GraphPalette {
  current: string
  tagFill: string
  neutral: string
  lines: string
  linesHighlight: string
  tagBorder: string
  text: string
  fontFamily: string
}

export interface NormalizedNode extends ForceGraphNode, SimulationNodeDatum {
  label: string
  tags: string[]
  kind: GraphNodeKind
  __initialDragPos?: {
    x: number
    y: number
    fx: number | null
    fy: number | null
  }
}

export interface NormalizedLink
  extends ForceGraphLink,
  SimulationLinkDatum<NormalizedNode> {
  source: string
  target: string
}

export interface NormalizedGraph {
  nodes: NormalizedNode[]
  links: NormalizedLink[]
}

export type GraphLink = ForceGraphLink

export interface NodeRenderData {
  simulationData: NormalizedNode
  gfx: Graphics
  label: Text
  active: boolean
}

export interface LinkRenderData {
  simulationData: SimulationLinkDatum<NormalizedNode>
  gfx: Graphics
  color: string | number
  alpha: number
  active: boolean
}

export interface RenderOptions {
  data: NormalizedGraph
  config: Required<ForceGraphConfig>
  activeNodeId: string | null
  onNodeSelect: (payload: GraphSelectionPayload) => void
}

export interface TweenHandle {
  update: (time: number) => void
  stop: () => void
}
