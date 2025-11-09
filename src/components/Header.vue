<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useIsDesktop } from '@/composables/useIsDesktop'
import Container from './Container.vue'

const { directions } = useWindowScroll({ throttle: 300 })
const isDesktop = useIsDesktop()
const isHeaderVisible = ref(true)

function updateVisibility() {
  if (isDesktop.value || directions.top) {
    isHeaderVisible.value = true
  }
  else if (directions.bottom) {
    isHeaderVisible.value = false
  }
}

watch([
  () => directions.top,
  () => directions.bottom,
  () => isDesktop.value,
], updateVisibility, { immediate: true })
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
        </nav>
        <slot name="mobile-nav" />
      </div>
    </Container>
  </header>
</template>
