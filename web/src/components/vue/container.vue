<script setup lang="ts">
import { cn } from '@/lib/utils'

interface ContainerProps {
  className?: string
  grid?: boolean
  strategy?: 'margin' | 'padding'
}


const {
  className = '',
  grid = false,
  strategy = 'padding',
} = defineProps<ContainerProps>()
</script>

<template>
  <div class="mx-auto w-full">
    <div
      :class="
        cn(
          {
            'grid grid-cols-12 gap-6': grid,
            'px-6 md:px-12 lg:px-20 xl:px-32': strategy === 'padding',
            'mx-6 md:mx-12 lg:mx-20 xl:mx-32': strategy === 'margin',
          },
          className
        )
      "
    >
      <slot />
    </div>
  </div>
</template>
