import type { siteConfig } from '@/site.config'

export type LanguageKeys = keyof typeof siteConfig.i18n.languages

function defineUI<T extends string>(t: Record<LanguageKeys, Record<T, string>>) {
  return t
}

export const ui = defineUI({
  en: {
    'nav.about': 'About',
    'nav.contacts': 'Contact',
    'nav.events': 'Events',
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'landing.date': 'Date',
    'landing.time': 'Time',
    'landing.location': 'Location',
    'landing.whoWeAre': 'Who we are',
    'landing.whatWeDo': 'What we do',
    'cursor.view': 'View',
  },
  id: {
    'nav.about': 'Tentang',
    'nav.contacts': 'Kontak',
    'nav.events': 'Acara',
    'contact.email': 'Email',
    'contact.follow': 'Follow',
    'landing.date': 'Tanggal',
    'landing.time': 'Waktu',
    'landing.location': 'Tempat',
    'landing.whoWeAre': 'Siapa kami',
    'landing.whatWeDo': 'Apa yang kami kerjakan',
    'cursor.view': 'Lihat',
  },
} as const)
