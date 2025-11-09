import type { LanguageKeys } from './ui'
import { siteConfig } from '@/site.config'
import { ui } from './ui'

const { defaultLang, showDefaultLang } = siteConfig.i18n
const LANG_COOKIE = 'i18n_lang'

export { type LanguageKeys }

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/')
  if (lang in ui)
    return lang as LanguageKeys
  return defaultLang
}

export function useTranslations(lang: LanguageKeys) {
  return function t(key: keyof (typeof ui)[LanguageKeys]) {
    return ui[lang][key] || ui[defaultLang][key]
  }
}

export function getPathWithoutLang(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const [firstSegment, ...restSegments] = segments

  if (firstSegment && firstSegment in ui) {
    const path = restSegments.join('/')
    return path ? `/${path}` : '/'
  }
  return pathname
}

export function useTranslatedPath(lang: LanguageKeys) {
  return function translatePath(path: string, l: string = lang) {
    let pathName = path.startsWith('/') ? path : `/${path}`
    pathName = pathName.replace(/\/+/g, '/')

    if (pathName === '/') {
      return !showDefaultLang && l === defaultLang ? '/' : `/${l}`
    }

    const hasTrailingSlash = pathName.endsWith('/') && pathName.length > 1
    const pathWithoutLang = getPathWithoutLang(pathName)
    const normalizedPath = hasTrailingSlash && pathWithoutLang !== '/'
      ? `${pathWithoutLang}/`
      : pathWithoutLang

    if (!showDefaultLang && l === defaultLang) {
      return normalizedPath
    }
    return normalizedPath === '/' ? `/${l}` : `/${l}${normalizedPath}`
  }
}

export function getPreferredLangFromCookie(): LanguageKeys | null {
  if (typeof document === 'undefined')
    return null

  const cookies = document.cookie.split(';')
  const langCookie = cookies.find(c => c.trim().startsWith(`${LANG_COOKIE}=`))

  if (!langCookie)
    return null

  const lang = langCookie.split('=')[1]
  return lang in ui ? (lang as LanguageKeys) : null
}

export function setPreferredLangCookie(lang: LanguageKeys): void {
  if (typeof document === 'undefined')
    return

  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${maxAge}; samesite=lax`
}

export function detectBrowserLanguage(): LanguageKeys {
  if (typeof navigator === 'undefined')
    return defaultLang

  const languages = Object.keys(ui) as Array<LanguageKeys>
  const browserLangs = navigator.languages || [navigator.language]

  for (const browserLang of browserLangs) {
    // Get just the language code (e.g., "en" from "en-US")
    const langCode = browserLang.split('-')[0] as LanguageKeys
    if (languages.includes(langCode)) {
      return langCode
    }
  }

  return defaultLang
}
