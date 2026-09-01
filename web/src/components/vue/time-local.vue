<script setup lang="ts">
import { computed } from 'vue'

import type { FormatDateOptions } from '@/composables/use-format-date'
import type { LanguageKeys } from '@/i18n'

import { useFormatDate } from '@/composables/use-format-date'

interface Props extends FormatDateOptions {
  lang?: LanguageKeys
  datetime: string | number | Date
  title?: boolean | string
}

const { datetime, lang, ...formatOptions } = defineProps<Props>()

const { formattedDate, isoDate } = useFormatDate(datetime, lang, formatOptions)

const title = computed(() => {
  if (formatOptions.title === true) {
    return isoDate.value
  }
  return formatOptions.title || ''
})
</script>

<template>
  <time :datetime="isoDate" :title="title">{{ formattedDate }}</time>
</template>
