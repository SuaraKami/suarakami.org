import type { LanguageKeys } from '@/i18n/ui'
import { useBrowserLocation } from '@vueuse/core'
import { computed } from 'vue'
import { getLangFromUrl, getPathWithoutLang } from '@/i18n/utils'
import { siteConfig } from '@/site.config'

export function useBrowserUrl() {
  const location = useBrowserLocation()

  const currentUrl = computed(() => {
    if (!location.value.host)
      return null
    return new URL(location.value.href || window.location.href)
  })

  const currentLang = computed(() => {
    if (!currentUrl.value)
      return siteConfig.i18n.defaultLang as LanguageKeys
    return getLangFromUrl(currentUrl.value) as LanguageKeys
  })

  const currentPathWithoutLang = computed(() => {
    if (!currentUrl.value)
      return '/'
    return getPathWithoutLang(currentUrl.value.pathname)
  })

  const currentHref = computed(() => {
    const url = currentUrl.value
    if (!url)
      return '/'
    return `${currentPathWithoutLang.value}${url.search}${url.hash}`
  })

  return {
    location,
    currentUrl,
    currentLang,
    currentPathWithoutLang,
    currentHref,
  }
}
