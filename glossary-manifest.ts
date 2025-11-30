import type { GlossaryManifestEntry } from './src/types/glossary'

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
