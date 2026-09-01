import type { CollectionEntry } from 'astro:content'

import { getCollection } from 'astro:content'

import type { LanguageKeys } from '@/i18n'

function latestDate(event: CollectionEntry<'event'>) {
  return Math.max(...event.data.dates.map((date) => date.getTime()))
}

export async function getLandingEvents(lang: LanguageKeys) {
  const all = await getCollection('event', (entry) =>
    entry.id.startsWith(`${lang}/`)
  )
  const sorted = all.toSorted((a, b) => latestDate(a) - latestDate(b))

  // If more than one event is marked, the most recent one wins.
  const featuredEvent = sorted.findLast((event) => event.data.featured)

  return {
    events: sorted.filter((event) => event.id !== featuredEvent?.id),
    featuredEvent,
  }
}
