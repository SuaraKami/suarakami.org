import type { CollectionEntry } from 'astro:content'

import { getCollection } from 'astro:content'

import type { LanguageKeys } from '@/i18n'

function latestDate(event: CollectionEntry<'event'>) {
  return Math.max(...event.data.dates.map((date) => date.getTime()))
}

export async function getLandingEvents(
  lang: LanguageKeys,
  promotedEventSlug?: string | null
) {
  const all = await getCollection('event', (entry) =>
    entry.id.startsWith(`${lang}/`)
  )
  const sorted = all.toSorted((a, b) => latestDate(a) - latestDate(b))

  const promotedEvent = promotedEventSlug
    ? sorted.find((event) => event.id === `${lang}/events/${promotedEventSlug}`)
    : undefined

  return {
    events: sorted.filter((event) => event.id !== promotedEvent?.id),
    promotedEvent,
  }
}
