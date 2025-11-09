<script setup lang="ts">
import type { LanguageKeys } from '@/i18n/ui'
import { useBrowserUrl } from '@/composables/useBrowserUrl'
import { siteConfig } from '@/site.config'
import LinkLocal from './LinkLocal.vue'

const {
  class: className = '',
  activeLangClass = '',
  langClass = '',
} = defineProps<{
  class?: string
  langClass?: string
  activeLangClass?: string
}>()

const { languages } = siteConfig.i18n
const languageKeys = Object.keys(languages) as LanguageKeys[]

const { currentHref } = useBrowserUrl()
</script>

<template>
  <div :class="className">
    <template v-for="(lang, i) in languageKeys" :key="lang">
      <LinkLocal
        :href="currentHref"
        :locale="lang"
        :class="langClass"
        :active-class="activeLangClass"
      >
        {{ lang }}
      </LinkLocal>
      <slot v-if="i < languageKeys.length - 1" name="separator" />
    </template>
  </div>
</template>
