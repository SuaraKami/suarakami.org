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

export const glossaryManifest: GlossaryManifestEntry[] = [
  {
    lemma: 'epistemologi',
    lang: 'ID',
    pos: ['NOUN'],
    preferredSources: ['WIKI', 'WIKIDATA'],
    maxCandidates: 5,
    targetLangs: ['ID'],
  },
/*   {
    lemma: 'metodologi',
    lang: 'ID',
    pos: ['NOUN'],
    preferredSources: ['WIKI', 'WIKIDATA'],
    targetLangs: ['ID'],
  },
  {
    lemma: 'jejaring',
    lang: 'ID',
    pos: ['NOUN'],
    preferredSources: ['WIKI', 'WIKIDATA'],
    targetLangs: ['ID'],
  }, */
]

export default glossaryManifest
