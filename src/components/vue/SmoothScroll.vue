<script setup lang="ts">
import { VueLenis } from 'lenis/vue'

const lenisOptions = {
  wheelMultiplier: 0.6,
}
</script>

<template>
  <VueLenis root :options="lenisOptions" />
</template>
