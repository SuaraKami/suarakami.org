<script setup lang="ts">
import type { LanguageKeys } from '@/i18n'
import { useEventListener, useMediaQuery, useMouse } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useTranslations } from '@/i18n'
import ClientOnly from './ClientOnly.vue'

const props = defineProps<{
  lang: LanguageKeys
}>()

const t = useTranslations(props.lang)
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
      :class="isHoveringLink ? 'size-20' : 'size-5'"
      :style="cursorStyle"
    >
      <span
        v-if="isHoveringLink"
        class="
          text-xs font-medium tracking-widest text-white uppercase duration-200
          fade-in
        "
      >
        {{ t('cursor.view') }}
      </span>
    </div>
  </ClientOnly>
</template>
