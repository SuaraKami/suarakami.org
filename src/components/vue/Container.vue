<script setup lang="ts">
import { cn } from '@/lib/utils'

interface ContainerProps {
  class?: string
  grid?: boolean
  strategy?: 'margin' | 'padding'
}

const props = withDefaults(defineProps<ContainerProps>(), {
  class: '',
  grid: false,
  strategy: 'padding',
})
</script>

<template>
  <div class="mx-auto w-full">
    <div
      :class="cn(
        { 'grid grid-cols-12 gap-6': props.grid,
          'px-6 md:px-12 lg:px-20 xl:px-32': props.strategy === 'padding',
          'mx-6 md:mx-12 lg:mx-20 xl:mx-32': props.strategy === 'margin',
        },
        props.class,
      )"
    >
      <slot />
    </div>
  </div>
</template>
