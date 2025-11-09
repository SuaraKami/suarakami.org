<script setup lang="ts">
import type { LanguageKeys } from '@/i18n'
import { computed } from 'vue'
import { siteConfig } from '@/site.config'
import ClientOnly from './ClientOnly.vue'

interface Props {
  lang?: LanguageKeys
  datetime?: string | number | Date
  localeMatcher?: 'best fit' | 'lookup'
  weekday?: 'long' | 'short' | 'narrow'
  era?: 'long' | 'short' | 'narrow'
  year?: 'numeric' | '2-digit'
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  day?: 'numeric' | '2-digit'
  hour?: 'numeric' | '2-digit'
  minute?: 'numeric' | '2-digit'
  second?: 'numeric' | '2-digit'
  timeZoneName?: 'short' | 'long' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric'
  formatMatcher?: 'best fit' | 'basic'
  hour12?: boolean
  timeZone?: string

  calendar?: string
  dayPeriod?: 'narrow' | 'short' | 'long'
  numberingSystem?: string

  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24'
  title?: boolean | string
}

const {
  datetime = Date.now(),
  lang = siteConfig.i18n.defaultLang,
  ...formatOptions
} = defineProps<Props>()

const date = computed(() => {
  return datetime instanceof Date ? datetime : new Date(datetime)
})

const formattedDate = computed(() => {
  const { languages } = siteConfig.i18n
  return date.value.toLocaleDateString(languages[lang].code, formatOptions)
})

const isoDate = computed(() => date.value.toISOString())
const title = computed(() =>
  formatOptions.title === true ? isoDate.value : typeof formatOptions.title === 'string' ? formatOptions.title : undefined,
)
</script>

<template>
  <ClientOnly>
    <time :datetime="isoDate" :title="title">
      {{ formattedDate }}
    </time>
  </ClientOnly>
</template>
