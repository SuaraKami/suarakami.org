/**
 * Fetch glossary entries from BabelNet based on a manual manifest and
 * write them into the Astro glossary content collection for type-safe use.
 *
 * Usage:
 *   bun run scripts/fetch-babelnet.ts
 *
 * Env vars:
 *   BABELNET_KEY (required)
 *   MAX_QPS (default 1)
 *   FETCH_GLOSSARY_DRY_RUN=1 to log without writing
 *   FETCH_GLOSSARY_FAIL_ON_MISSING=1 to exit non-zero on failures
 */

import type { CollectionEntry } from 'astro:content'
import type { GlossaryManifestEntry } from '../glossary-manifest'

import fs from 'node:fs/promises'
import path from 'node:path'

import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { glossaryManifest } from '../glossary-manifest'

type GlossaryEntry = CollectionEntry<'glossary'>['data']

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(root, 'src', 'content', 'glossary')

const key = process.env.BABELNET_KEY
if (!key) {
  console.error('Missing BABELNET_KEY env variable.')
  process.exit(1)
}

const allowedRelationShortNames = new Set([
  'has-kind',
  'deriv',
  'is-a',
  'said_to_be_the_same_as',
  'has_part',
  'subclass_of',
  'part_of',
])

const generated = new Map<string, string | null>()
const failures: { senseId: string, reason: string }[] = []
const slugCounts = new Map<string, number>()

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${body}`)
  }
  return res.json() as Promise<T>
}

function buildQuery(base: string, params: Record<string, string | number | string[] | undefined>) {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined)
      return
    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, String(item)))
      return
    }
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

type ManifestEntry = GlossaryManifestEntry

interface GlossCandidate {
  id: string
  pos?: string
  source?: string
}

interface BabelGloss { language?: string, source?: string, gloss?: string }
interface BabelEdge {
  target?: string
  language?: string
  weight?: number
  normalizedWeight?: number
  pointer?: {
    fSymbol?: string
    name?: string
    shortName?: string
    relationGroup?: string
  }
}

interface SynsetSense {
  properties?: { simpleLemma?: string, pos?: string }
  lemma?: string
}

interface SynsetResponse {
  glosses?: BabelGloss[]
  senses?: SynsetSense[]
  mainGloss?: string
  mainSenseGloss?: string
}

type AstroGlossaryEntry = CollectionEntry<'glossary'>['data']
type AstroGlossaryRelation = AstroGlossaryEntry['relations'][number]
interface GlossaryEntry extends Omit<AstroGlossaryEntry, 'relations'> {
  relations: GlossaryRelation[]
}
interface GlossaryRelation extends Omit<AstroGlossaryRelation, 'to'> {
  to: string
}

interface DefinitionContext { lang?: string, targetLangs?: string[] }

interface SenseRequest {
  senseId: string
  lemma?: string
  entryLang?: string
  definitionLangs: string[]
  relations?: GlossaryRelation[]
}

async function resolveSynset(entry: ManifestEntry): Promise<string> {
  if (entry.manualPick)
    return entry.manualPick
  if (entry.id)
    return entry.id
  if (!entry.lemma)
    throw new Error('Manifest entry needs either id or lemma')

  const url = buildQuery('https://babelnet.io/v9/getSynsetIds', {
    lemma: entry.lemma,
    searchLang: entry.lang ?? 'EN',
    pos: entry.pos?.join(','),
    key,
  })
  const candidates = await throttledFetch<GlossCandidate[]>(url)
  const filtered = candidates.filter(candidate =>
    !entry.pos || entry.pos.includes((candidate.pos ?? '').toUpperCase()),
  )
  const ordered = (filtered.length ? filtered : candidates).slice(0, entry.maxCandidates ?? 3)
  if (!ordered.length)
    throw new Error(`No synset candidates found for lemma ${entry.lemma}`)

  const byPreference = entry.preferredSources
    ? ordered.find(candidate => candidate.source && entry.preferredSources?.includes(candidate.source))
    : undefined
  return (byPreference ?? ordered[0]).id
}

async function fetchSynset(senseId: string, entry?: { lang?: string, targetLangs?: string[] }) {
  const url = buildQuery('https://babelnet.io/v9/getSynset', {
    id: senseId,
    targetLang: equivalentLangs(entry).join(','),
    key,
  })
  return throttledFetch<SynsetResponse>(url)
}

async function fetchOutgoingEdges(senseId: string) {
  const url = buildQuery('https://babelnet.io/v9/getOutgoingEdges', { id: senseId, key })
  return throttledFetch<BabelEdge[]>(url)
}

function makeSlug(term: string) {
  const base = slugify(term) || 'entry'
  const count = slugCounts.get(base) ?? 0
  slugCounts.set(base, count + 1)
  return count === 0 ? base : `${base}-${count + 1}`
}

interface DefinitionSelection { text: string, lang: string }

function pickDefinition(
  glosses: BabelGloss[] = [],
  allowedLangs: string[],
  synset: SynsetResponse,
): DefinitionSelection | null {
  for (const lang of allowedLangs) {
    const match = glosses.find(gloss => gloss.language?.toUpperCase() === lang && gloss.gloss)
    if (match?.gloss)
      return match.gloss
  }

  const fallback = glosses.find(gloss => gloss.gloss)
  if (fallback?.gloss)
    return fallback.gloss

  const mainGloss = synsetData.mainGloss ?? synsetData.mainSenseGloss
  if (typeof mainGloss === 'string' && mainGloss.length)
    return { text: mainGloss, lang: allowedLangs[0] ?? 'EN' }

  return null
}

function formatAlias(raw?: string | null) {
  if (!raw)
    return ''
  const cleaned = raw.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleaned)
    return cleaned
  const lower = cleaned.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function normalizeEntry(
  senseId: string,
  synset: SynsetResponse,
  context: { lang?: string, lemma?: string },
  allowedLangs: string[],
  relations: Relation[],
): GlossaryEntry {
  console.log(`Processing ${senseId}`, synset.senses)
  const senses = synset.senses ?? []
  const aliasSet = new Set<string>()
  const aliases: string[] = []
  for (const sense of senses) {
    const raw = sense.properties?.simpleLemma || sense.lemma
    if (raw) {
      const formatted = formatAlias(raw)
      if (formatted && !aliasSet.has(formatted)) {
        aliasSet.add(formatted)
        aliases.push(formatted)
      }
    }
  }

  const definition = pickDefinition(synset.glosses, request.definitionLangs, synset)
  if (!definition)
    return null

  const rawTerm = request.lemma ?? aliases[0] ?? request.senseId
  const term = formatAlias(rawTerm) || rawTerm
  const pos = senses[0]?.properties?.pos ?? 'UNKNOWN'
  const entryLang = context.lang ?? allowedLangs[0] ?? 'EN'

  return {
    term,
    definition: definition.text,
    lang: entryLang,
    pos,
    confidence: 1,
    aliases,
    examples: [],
    relations,
    sourceMeta: {
      provider: 'BabelNet',
      fetchedAt: new Date().toISOString(),
    },
  }
}

async function writeEntry(entry: GlossaryEntry, senseId: string) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  const slug = makeSlug(entry.term)
  const filePath = path.join(OUTPUT_DIR, `${slug}.json`)
  await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf8')
  generated.set(senseId, slug)
  console.log(`✔ wrote ${filePath}`)
}

async function upsertSense(request: SenseRequest, fetchLangs?: string[]) {
  if (generated.has(request.senseId))
    return generated.get(request.senseId)

  const synset = await fetchSynset(request.senseId, fetchLangs?.length ? { targetLangs: fetchLangs } : undefined)
  const entry = normalizeEntry(synset, request)
  if (!entry) {
    failures.push({ senseId: request.senseId, reason: 'Missing definition' })
    generated.set(request.senseId, null)
    return null
  }
  return writeEntry(entry, request.senseId)
}

async function collectRelations(
  parentSenseId: string,
  relationLangs: string[],
  childDefinitionLangs: string[],
) {
  const edges = await fetchOutgoingEdges(parentSenseId)
  const seen = new Set<string>()
  const kept: GlossaryRelation[] = []

  for (const edge of edges) {
    const lang = edge.language?.toUpperCase()
    if (!edge.target)
      continue
    if (lang && lang !== 'MUL' && !relationLangs.includes(lang))
      continue
    const shortName = edge.pointer?.shortName
    if (!shortName || !allowedRelationShortNames.has(shortName))
      continue

    const childRequest: SenseRequest = {
      senseId: edge.target,
      definitionLangs: childDefinitionLangs,
      relations: [],
    }

    const childSlug = await upsertSense(childRequest)
    if (!childSlug)
      continue

    const relationKey = `${shortName}:${edge.target}`
    if (seen.has(relationKey))
      continue
    seen.add(relationKey)

    kept.push({
      to: childSlug,
      type: shortName,
      label: edge.pointer?.name ?? shortName,
    })
  }

  return kept
}

async function processManifestEntry(entry: GlossaryManifestEntry) {
  const senseId = await resolveSynset(entry)
  const definitionLangs = getDefinitionLangs(entry)
  const relationLangs = entry.lang ? [entry.lang.toUpperCase()] : definitionLangs
  const relationDefinitionLangs = [...new Set([...definitionLangs, 'EN'])]

  const relations = await collectRelations(
    senseId,
    relationLangs,
    relationDefinitionLangs,
  )

  const request: SenseRequest = {
    senseId,
    lemma: entry.lemma,
    entryLang: entry.lang,
    definitionLangs,
    relations,
  }

  await upsertSense(request, definitionLangs)
}

async function main() {
  console.log('Fetching glossary entries based on glossary-manifest.ts')

  for (const manifestEntry of glossaryManifest) {
    try {
      const senseId = await resolveSynset(manifestEntry)
      enqueue({ senseId, lang: manifestEntry.lang, targetLangs: manifestEntry.targetLangs, manifestEntry })
    }
    catch (error) {
      failures.push({ senseId: manifestEntry.lemma ?? manifestEntry.id ?? 'unknown', error })
      console.error(`✖ Failed to resolve ${manifestEntry.lemma ?? manifestEntry.id}:`, error)
    }
  }

  while (queue.length) {
    const job = queue.shift()!
    try {
      await handleJob(job)
    }
    catch (error) {
      failures.push({ senseId: job.senseId, error })
      console.error(`✖ Failed to process ${job.senseId}:`, error)
    }
  }

  console.log(`\nSummary: ${processed.size} entries written, ${failures.length} failures.`)
  if (failures.length) {
    failures.forEach(failure => console.error('- ', failure.senseId, '->', failure.error))
    if (FAIL_ON_MISSING)
      process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
