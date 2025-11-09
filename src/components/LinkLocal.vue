<script setup lang="ts">
import type { LanguageKeys } from '@/i18n/ui'
import { computed } from 'vue'
import { useBrowserUrl } from '@/composables/useBrowserUrl'
import { useTranslatedPath } from '@/i18n/utils'
import { cn } from '@/lib/utils'

const {
  href,
  locale,
  class: className = '',
  activeClass = '',
} = defineProps<{
  href: string
  locale?: LanguageKeys
  class?: string
  activeClass?: string
}>()

const { currentUrl, currentLang } = useBrowserUrl()

const linkData = computed(() => {
  const url = currentUrl.value
  if (!url)
    return { href, isActive: false, isExternal: false }

  const baseOrigin = url.origin
  const parsedUrl = new URL(href, baseOrigin)
  const isExternal = parsedUrl.origin !== baseOrigin

  if (isExternal) {
    return {
      href,
      isActive: false,
      isExternal: true,
    }
  }

  const lang = locale ?? currentLang.value
  const translatePath = useTranslatedPath(lang)
  const translatedPath = translatePath(parsedUrl.pathname)
  const finalHref = `${translatedPath}${parsedUrl.search}${parsedUrl.hash}`

  const normalizedFinalPath = normalizePath(translatedPath)
  const normalizedCurrentPath = normalizePath(url.pathname)
  const pathsMatch = normalizedFinalPath === normalizedCurrentPath
  const hashesMatch = parsedUrl.hash ? parsedUrl.hash === url.hash : true
  const isActive = pathsMatch && hashesMatch

  return {
    href: finalHref,
    isActive,
    isExternal: false,
  }
})

const linkClass = computed(() => {
  return cn(className, {
    [activeClass]: linkData.value.isActive,
  })
})

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/'
}
</script>

<template>
  <a :href="linkData.href" :class="linkClass">
    <slot />
  </a>
</template>
