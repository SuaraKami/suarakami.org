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
    'landing.date': 'Date',
    'landing.getTickets': 'Get Tickets',
    'landing.howWeWork': 'How we work',
    'landing.location': 'Location',
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
  },
  id: {
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'events.event': 'Acara',
    'events.number': 'No.',
    'landing.date': 'Tanggal',
    'landing.getTickets': 'Beli Tiket',
    'landing.howWeWork': 'Cara kami bekerja',
    'landing.location': 'Tempat',
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
  },
} as const)
