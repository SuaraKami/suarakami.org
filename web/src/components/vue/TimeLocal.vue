<script setup lang="ts">
  import { computed } from "vue";
  import type { FormatDateOptions } from "@/composables/useFormatDate";
  import { useFormatDate } from "@/composables/useFormatDate";
  import type { LanguageKeys } from "@/i18n";

  interface Props extends FormatDateOptions {
    lang?: LanguageKeys;
    datetime: string | number | Date;
    title?: boolean | string;
  }

  const { datetime, lang, ...formatOptions } = defineProps<Props>();

  const { formattedDate, isoDate } = useFormatDate(
    datetime,
    lang,
    formatOptions
  );

  const title = computed(() => {
    if (formatOptions.title === true) {
      return isoDate.value;
    }
    if (typeof formatOptions.title === "string") {
      return formatOptions.title;
    }
    return;
  });
</script>

<template>
  <time :datetime="isoDate" :title="title">{{ formattedDate }}</time>
</template>
