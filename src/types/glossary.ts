export interface Relation {
  to: string
  type: string
  label?: string
  weight?: number
}

export interface GlossaryManifestEntry {
  id?: string
  lemma?: string
  lang?: string
  pos?: string[]
  preferredSources?: string[]
  manualPick?: string
  maxCandidates?: number
  targetLangs?: string[]
}
