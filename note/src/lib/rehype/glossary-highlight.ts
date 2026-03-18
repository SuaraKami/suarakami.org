import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import type { Element, Root, Text } from 'hast'
import { visitParents } from 'unist-util-visit-parents'

const DEFAULT_GLOSSARY_DIR = path.resolve(
  process.cwd(),
  'src',
  'content',
  'glossary'
)
const WORD_CHAR_REGEX = /[\p{L}\p{N}_-]/u
const BANNED_TAGS = new Set([
  'code',
  'pre',
  'kbd',
  'samp',
  'var',
  'script',
  'style',
  'glossary-term',
])
const BANNED_ANCESTORS = new Set(['a', 'button'])

interface GlossaryPluginOptions {
  directory?: string
}

interface GlossaryToken {
  slug: string
  canonical: string
  display: string
  lower: string
}

export function rehypeGlossaryHighlight(options: GlossaryPluginOptions = {}) {
  const glossaryDir = options.directory ?? DEFAULT_GLOSSARY_DIR
  const tokens = loadGlossaryTokens(glossaryDir)

  if (!tokens.length) {
    return () => {}
  }

  return (tree: Root) => {
    visitParents(tree, 'text', (node: Text, ancestors) => {
      if (!node.value || typeof node.value !== 'string') {
        return
      }
      if (!ancestors.length) {
        return
      }

      const parent = ancestors.at(-1)
      if (!parent || parent.type !== 'element') {
        return
      }
      if (shouldSkipNode(parent as Element, ancestors)) {
        return
      }

      const matches = findMatches(node.value, tokens)
      if (!matches.length) {
        return
      }

      const fragments: (Text | Element)[] = []
      let cursor = 0
      for (const match of matches) {
        if (match.start > cursor) {
          fragments.push({
            type: 'text',
            value: node.value.slice(cursor, match.start),
          })
        }
        fragments.push(
          createGlossaryButton(
            node.value.slice(match.start, match.end),
            match.token
          )
        )
        cursor = match.end
      }
      if (cursor < node.value.length) {
        fragments.push({ type: 'text', value: node.value.slice(cursor) })
      }

      const index = (parent as Element).children.indexOf(node)
      if (index === -1) {
        return
      }

      ;(parent as Element).children.splice(index, 1, ...fragments)
    })
  }
}

function loadGlossaryTokens(directory: string): GlossaryToken[] {
  let files: string[] = []
  try {
    files = fs.readdirSync(directory)
  } catch (error) {
    console.warn('[glossary] failed to read directory', directory, error)
    return []
  }

  const tokens: GlossaryToken[] = []
  const seen = new Set<string>()

  for (const file of files) {
    if (!file.endsWith('.json')) {
      continue
    }
    const filepath = path.join(directory, file)
    try {
      const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
      const slug = file.replace(/\.json$/, '')
      const base = [raw.term, ...(raw.aliases ?? [])]
      for (const candidate of base) {
        const normalized = typeof candidate === 'string' ? candidate.trim() : ''
        if (!normalized) {
          continue
        }
        const key = normalized.toLowerCase()
        if (seen.has(key)) {
          continue
        }
        seen.add(key)
        tokens.push({
          slug,
          canonical: raw.term,
          display: normalized,
          lower: key,
        })
      }
    } catch (error) {
      console.warn('[glossary] failed to parse', filepath, error)
    }
  }

  return tokens.sort((a, b) => b.lower.length - a.lower.length)
}

function shouldSkipNode(
  parent: Element,
  ancestors: (Element | Root | Text)[]
): boolean {
  if (parent.type !== 'element') {
    return true
  }
  if (BANNED_TAGS.has(parent.tagName)) {
    return true
  }
  if (
    ancestors.some(
      (node) =>
        node.type === 'element' &&
        (BANNED_TAGS.has((node as Element).tagName) ||
          BANNED_ANCESTORS.has((node as Element).tagName))
    )
  ) {
    return true
  }
  return false
}

function findMatches(value: string, tokens: GlossaryToken[]) {
  const lower = value.toLowerCase()
  const matches: { start: number; end: number; token: GlossaryToken }[] = []

  for (const token of tokens) {
    let startIndex = 0
    while (startIndex < lower.length) {
      const idx = lower.indexOf(token.lower, startIndex)
      if (idx === -1) {
        break
      }
      const end = idx + token.lower.length
      if (isWordBoundary(value, idx, end) && !hasOverlap(matches, idx, end)) {
        matches.push({ start: idx, end, token })
      }
      startIndex = end
    }
  }

  return matches.sort((a, b) => a.start - b.start)
}

function isWordBoundary(text: string, start: number, end: number) {
  const prev = text[start - 1]
  const next = text[end]
  return !(
    (prev && WORD_CHAR_REGEX.test(prev)) ||
    (next && WORD_CHAR_REGEX.test(next))
  )
}

function hasOverlap(
  matches: { start: number; end: number }[],
  start: number,
  end: number
) {
  return matches.some((match) => !(end <= match.start || start >= match.end))
}

function createGlossaryButton(text: string, token: GlossaryToken): Element {
  return {
    type: 'element',
    tagName: 'glossary-term',
    properties: {
      slug: token.slug,
      'aria-label': `Lihat glosarium untuk ${text}`,
    },
    children: [{ type: 'text', value: text }],
  }
}
