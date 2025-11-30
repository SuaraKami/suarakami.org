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
import type { GlossaryManifestEntry, Relation } from '@/types/glossary'
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

const MAX_QPS = Number(process.env.MAX_QPS ?? 1)
const FAIL_ON_MISSING
  = (process.env.FETCH_GLOSSARY_FAIL_ON_MISSING) === '1'

const REQUEST_INTERVAL_MS = Math.max(1, Math.floor(1000 / Math.max(MAX_QPS, 1)))
let lastRequestAt = 0

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function throttledFetch<T>(url: string): Promise<T> {
  const now = Date.now()
  const wait = lastRequestAt + REQUEST_INTERVAL_MS - now
  if (wait > 0)
    await sleep(wait)
  lastRequestAt = Date.now()

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

interface FetchJob {
  senseId: string
  lang?: string
  targetLangs?: string[]
  manifestEntry?: ManifestEntry
}

const ALLOWED_RELATION_SHORTNAMES = [
  'has-kind',
  'deriv',
  'is-a',
  'said_to_be_the_same_as',
  'has_part',
  'subclass_of',
  'part_of',
]

const processed = new Set<string>()
const enqueued = new Set<string>()
const queue: FetchJob[] = []
const failures: { senseId: string, error: unknown }[] = []

function equivalentLangs(entry?: { lang?: string, targetLangs?: string[] }) {
  const langs = entry?.targetLangs?.length
    ? entry.targetLangs
    : entry?.lang
      ? [entry.lang]
      : ['EN']
  return [...new Set(langs.map(lang => lang.toUpperCase()))]
}

function slugify(term: string) {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function makeSlug(term: string, senseId: string) {
  const safeSense = senseId.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const base = slugify(term)
  return base ? `${base}-${safeSense}` : safeSense
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

function pickDefinition(glosses: BabelGloss[] = [], allowedLangs: string[], synsetData: SynsetResponse) {
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
    return mainGloss

  return 'Definition not available'
}

function buildRelations(edges: BabelEdge[], allowedLangs: string[]): Relation[] {
  const seen = new Set<string>()
  return edges
    .filter((edge) => {
      if (!edge.target)
        return false
      const lang = edge.language?.toUpperCase()
      if (!lang)
        return false
      return allowedLangs.includes(lang) || lang === 'MUL'
    })
    .filter((edge) => {
      const shortName = edge.pointer?.shortName
      return Boolean(shortName && ALLOWED_RELATION_SHORTNAMES.includes(shortName))
    })
    .map(edge => ({
      to: String(edge.target),
      type: String(edge.pointer?.shortName ?? ''),
      label: edge.pointer?.name ?? edge.pointer?.shortName ?? edge.pointer?.relationGroup,
      weight: typeof edge.normalizedWeight === 'number' ? edge.normalizedWeight : edge.weight,
    }))
    .filter((relation) => {
      if (!relation.type.length)
        return false
      const key = `${relation.type}:${relation.to}`
      if (seen.has(key))
        return false
      seen.add(key)
      return true
    })
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
  const aliases = Array.from(
    new Set(
      senses
        .map(sense => sense.properties?.simpleLemma || sense.lemma)
        .filter((value): value is string => Boolean(value)),
    ),
  )
  const definition = pickDefinition(synset.glosses, allowedLangs, synset)
  const pos = senses[0]?.properties?.pos ?? 'UNKNOWN'
  const entryLang = context.lang ?? allowedLangs[0] ?? 'EN'

  return {
    term: context.lemma ?? aliases[0] ?? senseId,
    senseId,
    definition,
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

async function writeEntryFile(entry: GlossaryEntry) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  const slug = makeSlug(entry.term, entry.senseId)
  const filePath = path.join(OUTPUT_DIR, `${slug}.json`)
  await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf8')
  console.log(`✔ wrote ${filePath}`)
}

function enqueue(job: FetchJob) {
  if (enqueued.has(job.senseId))
    return
  enqueued.add(job.senseId)
  queue.push(job)
}

async function handleJob(job: FetchJob) {
  if (processed.has(job.senseId))
    return

  const context = job.manifestEntry ?? { lang: job.lang, targetLangs: job.targetLangs }
  const allowedLangs = equivalentLangs(context)
  const synset = await fetchSynset(job.senseId, context)
  const edges = await fetchOutgoingEdges(job.senseId)
  const relations = buildRelations(edges, allowedLangs)

  const entry = normalizeEntry(
    job.senseId,
    synset,
    { lang: context.lang, lemma: job.manifestEntry?.lemma },
    allowedLangs,
    relations,
  )
  await writeEntryFile(entry)
  processed.add(job.senseId)

  if (job.manifestEntry) {
    // Seed entries should materialize their direct relation targets as standalone entries.
    relations.forEach((relation) => {
      if (!processed.has(relation.to)) {
        enqueue({
          senseId: relation.to,
          lang: context.lang,
          targetLangs: job.manifestEntry?.targetLangs,
        })
      }
    })
  }
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
