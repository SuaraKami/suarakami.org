import type { siteConfig } from '@/site.config'

export type LanguageKeys = keyof typeof siteConfig.i18n.languages

function defineUI<T extends string>(
  t: Record<LanguageKeys, Record<T, string>>
) {
  return t
}

export const ui = defineUI({
  en: {
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'landing.date': 'Date',
    'landing.getTickets': 'Get Tickets',
    'landing.location': 'Location',
    'landing.time': 'Time',
    'landing.upcomingEvent': 'Upcoming Event',
    'landing.whatWeDo': 'What we do',
    'landing.whoWeAre': 'Who we are',
    'nav.about': 'About',
    'nav.contacts': 'Contact',
    'nav.events': 'Events',
  },
  id: {
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'landing.date': 'Tanggal',
    'landing.getTickets': 'Beli Tiket',
    'landing.location': 'Tempat',
    'landing.time': 'Waktu',
    'landing.upcomingEvent': 'Acara Mendatang',
    'landing.whatWeDo': 'Apa yang kami kerjakan',
    'landing.whoWeAre': 'Siapa kami',
    'nav.about': 'Tentang',
    'nav.contacts': 'Kontak',
    'nav.events': 'Acara',
  },
} as const)
