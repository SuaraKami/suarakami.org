<script setup lang="ts">
import { cn } from '@/lib/utils'

const {
  class: className = '',
} = defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('mx-auto w-full max-w-(--ui-container) px-6 lg:px-8', className)">
    <slot />
  </div>
</template>
