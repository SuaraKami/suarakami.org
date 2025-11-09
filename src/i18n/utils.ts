import { siteConfig } from '@/site.config'
import { ui } from './ui'

const { defaultLang, showDefaultLang } = siteConfig.i18n

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/')
  if (lang in ui)
    return lang as keyof typeof ui
  return defaultLang
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
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

export function useTranslatedPath(lang: keyof typeof ui) {
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
