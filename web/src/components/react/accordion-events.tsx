import type { CollectionEntry } from 'astro:content'

import { Accordion } from '@base-ui/react/accordion'
import ChevronDown from '~icons/lucide/chevron-down'

import type { LanguageKeys } from '@/i18n'

import { formatDate } from '@/lib/format-date'
import { siteConfig } from '@/site.config'

interface Props {
  items: CollectionEntry<'event'>[]
  lang: LanguageKeys
}

const AccordionEvents = ({ items, lang }: Props) => (
  <Accordion.Root className="w-full">
    {items.map(({ data }, index) => (
      <Accordion.Item
        key={data.title}
        value={data.title}
        className="border-b border-foreground/15"
      >
        <Accordion.Header render={<div />} className="flex">
          <Accordion.Trigger className="group w-full py-6 text-left transition-opacity hover:opacity-50 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none md:py-7">
            <div className="grid grid-cols-12 items-start gap-x-6 gap-y-3">
              <p className="col-span-2 text-xs font-medium tracking-[0.18em] text-foreground/40 tabular-nums cap-trim md:col-span-1">
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="col-span-9 text-xs font-medium tracking-[0.18em] text-foreground/40 uppercase tabular-nums cap-trim md:col-span-2">
                {data.dates
                  .map((date) =>
                    formatDate(date, lang, {
                      day: 'numeric',
                      month: 'short',
                      timeZone: siteConfig.timeZone,
                      year: 'numeric',
                    })
                  )
                  .join(' & ')}
              </p>
              <div className="col-span-1 flex justify-end md:order-last md:col-start-12">
                <ChevronDown className="size-5 shrink-0 transition-transform duration-300 ease-out group-data-[panel-open]:rotate-180" />
              </div>
              <h3 className="col-span-10 col-start-3 text-xl font-normal tracking-tight text-balance cap-trim md:col-span-8 md:col-start-4 md:text-2xl lg:text-3xl">
                {data.title}
              </h3>
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
          <div className="grid grid-cols-12 gap-x-6 pb-8 md:pb-10">
            <p className="col-span-10 col-start-3 max-w-[60ch] text-base leading-relaxed text-pretty text-foreground/70 md:col-span-8 md:col-start-4 md:text-lg">
              {data.description}
            </p>
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    ))}
  </Accordion.Root>
)

export default AccordionEvents
