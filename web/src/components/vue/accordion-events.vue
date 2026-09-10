<script lang="ts">
import type { CollectionEntry } from 'astro:content'

import type { LanguageKeys } from '@/i18n'

import { cn } from '@/lib/utils'

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
      class="border-b border-border-dark last:border-0"
    >
      <AccordionHeader as="div" class="flex">
        <AccordionTrigger
          :class="
            cn(
              `group w-full py-6 text-left transition-opacity hover:opacity-50 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none`,
              {
                'md:pb-8': index === 0,
                'md:py-8': index > 0,
              }
            )
          "
        >
          <div class="grid grid-cols-12 items-start gap-6">
            <span
              class="col-span-3 mt-2 text-xs font-medium tracking-[0.18em] text-foreground/40 uppercase tabular-nums"
            >
              {{ datesString[index] }}
            </span>
            <div class="col-span-8 md:col-span-8">
              <h3
                class="text-2xl font-normal tracking-tight text-balance md:text-3xl lg:text-4xl"
              >
                {{ item.data.title }}
              </h3>
            </div>
            <div class="col-span-1 flex justify-end">
              <ChevronDown
                class="ms-auto size-6 shrink-0 transition-transform duration-300 ease-out group-data-[state=open]:rotate-180"
              />
            </div>
          </div>
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent
        class="overflow-hidden focus:outline-none data-[state=closed]:animate-[accordion-up_200ms_ease-out] data-[state=open]:animate-[accordion-down_200ms_ease-out]"
      >
        <div class="grid grid-cols-12 gap-6 pb-12">
          <div class="col-span-12 md:col-span-8 md:col-start-4">
            <p
              class="max-w-[60ch] text-lg leading-relaxed text-pretty text-foreground/70 md:text-xl"
            >
              {{ item.data.description }}
            </p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
