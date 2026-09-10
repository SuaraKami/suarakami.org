import type { siteConfig } from '@/site.config'

export type LanguageKeys = keyof typeof siteConfig.i18n.languages

export const languageKeys = ['en', 'id'] satisfies LanguageKeys[]

function defineUI<T extends string>(
  t: Record<LanguageKeys, Record<T, string>>
) {
  return t
}

export const ui = defineUI({
  en: {
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'landing.basedIn': 'Based in',
    'landing.date': 'Date',
    'landing.eventsHeld': 'Events held',
    'landing.getTickets': 'Get Tickets',
    'landing.location': 'Location',
    'landing.since': 'Since',
    'landing.time': 'Time',
    'landing.upcomingEvent': 'Upcoming Event',
    'landing.whatWeDo': 'What we do',
    'landing.whoWeAre': 'Who we are',
    'nav.about': 'About',
    'nav.contacts': 'Contact',
    'nav.events': 'Events',
    'site.location': 'Aachen, Germany',
  },
  id: {
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'landing.basedIn': 'Berbasis di',
    'landing.date': 'Tanggal',
    'landing.eventsHeld': 'Acara terselenggara',
    'landing.getTickets': 'Beli Tiket',
    'landing.location': 'Tempat',
    'landing.since': 'Sejak',
    'landing.time': 'Waktu',
    'landing.upcomingEvent': 'Acara Mendatang',
    'landing.whatWeDo': 'Apa yang kami kerjakan',
    'landing.whoWeAre': 'Siapa kami',
    'nav.about': 'Tentang',
    'nav.contacts': 'Kontak',
    'nav.events': 'Acara',
    'site.location': 'Aachen, Jerman',
  },
} as const)
