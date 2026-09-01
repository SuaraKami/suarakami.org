<script setup lang="ts">
import { computed } from 'vue'

import type { LanguageKeys } from '@/i18n'

import { useFormatDate } from '@/composables/use-format-date'

interface Props {
  datetime: string | number | Date
  lang?: LanguageKeys
  title?: boolean | string
  year?: 'numeric' | '2-digit'
}

const { datetime, lang, title: titleProp, year } = defineProps<Props>()

const { formattedDate, isoDate } = useFormatDate(datetime, lang, { year })

const title = computed(() => {
  if (titleProp === true) {
    return isoDate.value
  }
  return titleProp || ''
})
</script>

<template>
  <time :datetime="isoDate" :title="title">{{ formattedDate }}</time>
</template>
