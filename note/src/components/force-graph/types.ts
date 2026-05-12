import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3'

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

export type GraphSelectHandler = (payload: GraphSelectionPayload) => void

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
}

export type NormalizedLinkEndpoint = ForceGraphLink['source'] | NormalizedNode

export type NormalizedLink = Omit<ForceGraphLink, 'source' | 'target'>
  & SimulationLinkDatum<NormalizedNode>
  & {
    source: NormalizedLinkEndpoint
    target: NormalizedLinkEndpoint
  }

export interface NormalizedGraph {
  nodes: NormalizedNode[]
  links: NormalizedLink[]
}
