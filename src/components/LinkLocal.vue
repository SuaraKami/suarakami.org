<script setup lang="ts">
import type { LanguageKeys } from '@/i18n'
import { computed } from 'vue'
import { useBrowserUrl } from '@/composables/useBrowserUrl'
import { setPreferredLangCookie, useTranslatedPath } from '@/i18n'
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

  const pathsMatch = normalizePath(translatedPath) === normalizePath(url.pathname)
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

function handleClick() {
  if (locale) {
    setPreferredLangCookie(locale)
  }
}
</script>

<template>
  <a :href="linkData.href" :class="linkClass" @click="handleClick">
    <slot />
  </a>
</template>
