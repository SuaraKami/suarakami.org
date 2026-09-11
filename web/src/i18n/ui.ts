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
    'events.event': 'Event',
    'events.number': 'No.',
    'landing.basedIn': 'Based in',
    'landing.date': 'Date',
    'landing.eventsHeld': 'Events held',
    'landing.getTickets': 'Get Tickets',
    'landing.howWeWork': 'How we work',
    'landing.location': 'Location',
    'landing.since': 'Since',
    'landing.time': 'Time',
    'landing.upcomingEvent': 'Upcoming Event',
    'landing.whoWeAre': 'Who we are',
    'nav.about': 'About',
    'nav.closeMenu': 'Close menu',
    'nav.contacts': 'Contact',
    'nav.description': 'Sections, language, and contact details',
    'nav.events': 'Events',
    'nav.language': 'Language',
    'nav.main': 'Main navigation',
    'nav.openMenu': 'Open menu',
    'site.location': 'Aachen, Germany',
  },
  id: {
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'events.event': 'Acara',
    'events.number': 'No.',
    'landing.basedIn': 'Berbasis di',
    'landing.date': 'Tanggal',
    'landing.eventsHeld': 'Acara terselenggara',
    'landing.getTickets': 'Beli Tiket',
    'landing.howWeWork': 'Cara kami bekerja',
    'landing.location': 'Tempat',
    'landing.since': 'Sejak',
    'landing.time': 'Waktu',
    'landing.upcomingEvent': 'Acara Mendatang',
    'landing.whoWeAre': 'Siapa kami',
    'nav.about': 'Tentang',
    'nav.closeMenu': 'Tutup menu',
    'nav.contacts': 'Kontak',
    'nav.description': 'Bagian halaman, bahasa, dan informasi kontak',
    'nav.events': 'Acara',
    'nav.language': 'Bahasa',
    'nav.main': 'Navigasi utama',
    'nav.openMenu': 'Buka menu',
    'site.location': 'Aachen, Jerman',
  },
} as const)
