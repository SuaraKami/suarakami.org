<script setup lang="ts">
import type { LanguageKeys } from '@/i18n'
import { useBrowserUrl } from '@/composables/useBrowserUrl'
import { siteConfig } from '@/site.config'
import ClientOnly from './ClientOnly.vue'
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
  <ClientOnly v-slot="{ attrs }">
    <div v-bind="attrs" :class="className">
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
  </ClientOnly>
</template>
