<script setup lang="ts">
import type { FormatDateOptions } from '@/composables/useFormatDate'
import type { LanguageKeys } from '@/i18n'
import { computed } from 'vue'
import { useFormatDate } from '@/composables/useFormatDate'

interface Props extends FormatDateOptions {
  lang?: LanguageKeys
  datetime: string | number | Date
  title?: boolean | string
}

const {
  datetime,
  lang,
  ...formatOptions
} = defineProps<Props>()

const { formattedDate, isoDate } = useFormatDate(datetime, lang, formatOptions)

const title = computed(() =>
  formatOptions.title === true ? isoDate.value : typeof formatOptions.title === 'string' ? formatOptions.title : undefined,
)
</script>

<template>
  <time :datetime="isoDate" :title="title">
    {{ formattedDate }}
  </time>
</template>
