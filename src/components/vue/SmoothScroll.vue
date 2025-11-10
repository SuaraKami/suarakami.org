<script setup lang="ts">
import type { LenisOptions } from 'lenis'
import { until, useBrowserLocation } from '@vueuse/core'
import { useLenis, VueLenis } from 'lenis/vue'
import { onMounted } from 'vue'

const lenisOptions: LenisOptions = {
  autoRaf: true,
  wheelMultiplier: 0.6,
}

const lenis = useLenis()
const location = useBrowserLocation()

onMounted(async () => {
  const initialHash = window.__SK_INITIAL_HASH__ ?? location.value.hash
  if (!initialHash) {
    return
  }

  await until(lenis).toBeTruthy()

  lenis.value?.scrollTo(initialHash)
  const restoredPath = `${location.value.pathname}${location.value.search}${initialHash}`
  history.replaceState(null, '', restoredPath)
  window.__SK_INITIAL_HASH__ = undefined
})
</script>

<template>
  <VueLenis root :options="lenisOptions" />
</template>
