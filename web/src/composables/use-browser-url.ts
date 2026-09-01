import { useBrowserLocation } from '@vueuse/core'
import { computed } from 'vue'

import { getLangFromUrl, getPathWithoutLang } from '@/i18n'

export function useBrowserUrl() {
  const location = useBrowserLocation()

  const currentUrl = computed(() => {
    if (!location.value.host) {
      return null
    }
    return new URL(location.value.href || window.location.href)
  })

  const currentLang = computed(() => {
    if (!currentUrl.value) {
      return getLangFromUrl()
    }
    return getLangFromUrl(currentUrl.value)
  })

  const currentPathWithoutLang = computed(() => {
    if (!currentUrl.value) {
      return '/'
    }
    return getPathWithoutLang(currentUrl.value.pathname)
  })

  const currentHref = computed(() => {
    const url = currentUrl.value
    if (!url) {
      return '/'
    }
    return `${currentPathWithoutLang.value}${url.search}${url.hash}`
  })

  return {
    currentHref,
    currentLang,
    currentPathWithoutLang,
    currentUrl,
    location,
  }
}
