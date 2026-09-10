<script lang="ts">
import type { CollectionEntry } from 'astro:content'

import type { LanguageKeys } from '@/i18n'

type EventItem = CollectionEntry<'event'>

export interface AccordionProps {
  items: EventItem[]
  lang: LanguageKeys
}
</script>

<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'reka-ui'
import { computed } from 'vue'
import ChevronDown from '~icons/lucide/chevron-down'

import { formatDate } from '@/lib/format-date'
import { siteConfig } from '@/site.config'

const props = defineProps<AccordionProps>()

const datesString = computed(() =>
  props.items.map(({ data: { dates } }) =>
    dates
      .map((date) =>
        formatDate(date, props.lang, {
          day: 'numeric',
          month: 'short',
          timeZone: siteConfig.timeZone,
          year: 'numeric',
        })
      )
      .join(' & ')
  )
)
</script>

<template>
  <AccordionRoot collapsible type="single" class="w-full">
    <AccordionItem
      v-for="(item, index) in props.items"
      :key="item.data.title"
      :value="item.data.title"
      class="border-b border-foreground/15"
    >
      <AccordionHeader as="div" class="flex">
        <AccordionTrigger
          class="group w-full py-6 text-left transition-opacity hover:opacity-50 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none md:py-7"
        >
          <div class="grid grid-cols-12 items-start gap-x-6 gap-y-3">
            <p
              class="col-span-2 text-xs font-medium tracking-[0.18em] text-foreground/40 tabular-nums cap-trim md:col-span-1"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </p>
            <p
              class="col-span-9 text-xs font-medium tracking-[0.18em] text-foreground/40 uppercase tabular-nums cap-trim md:col-span-2"
            >
              {{ datesString[index] }}
            </p>
            <div
              class="col-span-1 flex justify-end md:order-last md:col-start-12"
            >
              <ChevronDown
                class="size-5 shrink-0 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180"
              />
            </div>
            <h3
              class="col-span-10 col-start-3 text-xl font-normal tracking-tight text-balance cap-trim md:col-span-8 md:col-start-4 md:text-2xl lg:text-3xl"
            >
              {{ item.data.title }}
            </h3>
          </div>
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent
        class="overflow-hidden focus:outline-none data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_200ms_ease-out]"
      >
        <div class="grid grid-cols-12 gap-x-6 pb-8 md:pb-10">
          <p
            class="col-span-10 col-start-3 max-w-[60ch] text-base leading-relaxed text-pretty text-foreground/70 md:col-span-8 md:col-start-4 md:text-lg"
          >
            {{ item.data.description }}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
