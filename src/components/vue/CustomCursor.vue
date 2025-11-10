<script setup lang="ts">
import { useEventListener, useMediaQuery, useMouse } from '@vueuse/core'
import { computed, ref } from 'vue'
import ClientOnly from './ClientOnly.vue'

const { x, y } = useMouse({ type: 'client' })
const isHoveringLink = ref(false)

const hasHover = useMediaQuery('(hover: hover) and (pointer: fine)')

const cursorStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
}))

function checkHoverTarget(event: MouseEvent, isEntering: boolean) {
  const target = event.target as HTMLElement
  if (target.closest('a, button')) {
    isHoveringLink.value = isEntering
  }
}

useEventListener(document, 'mouseover', event => checkHoverTarget(event, true))
useEventListener(document, 'mouseout', event => checkHoverTarget(event, false))
</script>

<template>
  <ClientOnly v-slot="{ attrs }">
    <div
      v-if="hasHover"
      v-bind="attrs"
      class="
        pointer-events-none fixed z-9999 flex -translate-x-1/2 -translate-y-1/2
        items-center justify-center rounded-full bg-sky-600 mix-blend-difference
        transition-[width,height,background-color] duration-300 ease-in-out
      "
      :class="isHoveringLink ? 'size-12' : 'size-5'"
      :style="cursorStyle"
    />
  </ClientOnly>
</template>
