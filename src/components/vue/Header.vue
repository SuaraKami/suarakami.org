<script setup lang="ts">
import type { LanguageKeys } from '@/i18n'
import { useWindowScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useIsDesktop } from '@/composables/useIsDesktop'
import ClientOnly from './ClientOnly.vue'
import Container from './Container.vue'
import LanguagePicker from './LanguagePicker.vue'
import MobileNavigation from './MobileNavigation.vue'

const { lang } = defineProps<{
  lang: LanguageKeys
}>()

const { directions, y } = useWindowScroll()
const isDesktop = useIsDesktop()
const isHeaderVisible = ref(true)
const isAtTop = computed(() => y.value === 0)

function updateVisibility() {
  if (isDesktop.value || directions.top || isAtTop.value) {
    isHeaderVisible.value = true
  }
  else if (directions.bottom) {
    isHeaderVisible.value = false
  }
}

watch([directions, isAtTop, isDesktop], updateVisibility)
</script>

<template>
  <header
    class="
      sticky top-0 z-50 border-b border-border bg-white transition-transform
      duration-300 ease-out
      md:relative md:translate-y-0
    "
    :class="{
      'translate-y-0': isHeaderVisible,
      '-translate-y-full': !isHeaderVisible,
    }"
  >
    <Container>
      <div class="flex items-center justify-between py-8 md:py-12">
        <slot name="logo" />
        <nav class="hidden items-center gap-12 md:flex lg:gap-16">
          <slot />
          <LanguagePicker
            class="
              flex items-center gap-2 border-l border-border pl-6 font-mono
              text-xs tracking-wider uppercase opacity-40
            "
            lang-class="opacity-40 transition-opacity hover:opacity-60"
            active-lang-class="opacity-100"
          >
            <template #separator>
              <span>/</span>
            </template>
          </LanguagePicker>
        </nav>
        <ClientOnly v-slot="{ attrs }">
          <MobileNavigation v-if="!isDesktop" v-bind="attrs" :lang>
            <template #logo>
              <slot name="logo" />
            </template>
          </MobileNavigation>
        </ClientOnly>
      </div>
    </Container>
  </header>
</template>
