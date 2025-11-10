<script lang="ts">
import type { CollectionEntry } from 'astro:content'
import type { AccordionRootEmits, AccordionRootProps } from 'reka-ui'
import type { LanguageKeys } from '@/i18n'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type EventItem = CollectionEntry<'event'>

export interface AccordionProps<T extends EventItem = EventItem> extends Pick<AccordionRootProps, 'collapsible' | 'defaultValue' | 'modelValue' | 'type' | 'disabled' | 'unmountOnHide'> {
  items: T[]
  lang: LanguageKeys
}
</script>

<script setup lang="ts" generic="T extends EventItem">
import { reactivePick } from '@vueuse/core'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  useForwardPropsEmits,
} from 'reka-ui'
import ChevronDown from '~icons/lucide/chevron-down'
import { useFormatDate } from '@/composables/useFormatDate'

const props = withDefaults(defineProps<AccordionProps<T>>(), {
  type: 'single',
  collapsible: true,
  unmountOnHide: false,
})
const emits = defineEmits<AccordionRootEmits>()

const rootProps = useForwardPropsEmits(reactivePick(props, 'collapsible', 'defaultValue', 'disabled', 'modelValue', 'unmountOnHide'), emits)

const datesString = computed(() =>
  props.items.map(({ data: { dates } }) =>
    dates.map(date => useFormatDate(date, props.lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).formattedDate.value).join(' & '),
  ),
)
</script>

<template>
  <AccordionRoot
    v-bind="rootProps" :type="type"
    class="w-full"
  >
    <AccordionItem
      v-for="(item, index) in props.items"
      :key="item.data.title"
      :value="item.data.title"
      class="border-b border-border-dark last:border-0"
    >
      <AccordionHeader as="div" class="flex">
        <AccordionTrigger
          :class="cn(
            `group w-full py-8 text-left transition-opacity hover:opacity-50`,
            {
              'md:pb-12': index === 0,
              'md:py-12': index > 0,
            },
          )"
        >
          <div class="grid grid-cols-12 items-start gap-6">
            <span
              class="
                col-span-3 mt-0.5 font-mono text-xs tracking-wider opacity-40
                md:col-span-2
              "
            >
              {{ datesString[index] }}
            </span>
            <div class="col-span-8 space-y-4 md:col-span-9">
              <h3 class="text-2xl md:text-3xl">
                {{ item.data.title }}
              </h3>
            </div>
            <div class="col-span-1 flex justify-end">
              <ChevronDown
                class="
                  ms-auto size-5 shrink-0 transition-transform duration-200
                  group-data-[state=open]:rotate-180
                "
              />
            </div>
          </div>
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent
        class="
          overflow-hidden
          focus:outline-none
          data-[state=closed]:animate-[accordion-up_200ms_ease-out]
          data-[state=open]:animate-[accordion-down_200ms_ease-out]
        "
      >
        <div class="grid grid-cols-12 gap-6 pb-12">
          <div
            class="col-span-12 md:col-span-9 md:col-start-3"
          >
            <p class="opacity-60">
              {{ item.data.description }}
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
