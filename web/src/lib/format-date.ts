import type { LanguageKeys } from '@/i18n'

import { siteConfig } from '@/site.config'

export function formatDate(
  datetime: string | number | Date,
  lang: LanguageKeys = siteConfig.i18n.defaultLang,
  options?: Intl.DateTimeFormatOptions
) {
  const locale = siteConfig.i18n.languages[lang].code
  return new Date(datetime).toLocaleDateString(locale, options)
}
