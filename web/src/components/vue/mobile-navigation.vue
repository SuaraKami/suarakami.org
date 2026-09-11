<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from 'reka-ui'
import Menu from '~icons/lucide/menu'
import X from '~icons/lucide/x'

import type { LanguageKeys } from '@/i18n'

import { useTranslations } from '@/i18n'
import { siteConfig } from '@/site.config'

const { lang } = defineProps<{
  lang: LanguageKeys
  navItems: {
    href: string
    label: string
  }[]
}>()

const { socialMediaLinks, email } = siteConfig
const t = useTranslations(lang)
</script>

<template>
  <DialogRoot>
    <DialogTrigger
      :aria-label="t('nav.openMenu')"
      class="inline-flex min-h-11 items-center md:hidden"
    >
      <Menu class="size-6" :stroke-width="1.5" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-foreground/10" />
      <DialogContent class="fixed inset-0 z-50 flex flex-col bg-background">
        <VisuallyHidden>
          <DialogTitle>{{ t('nav.main') }}</DialogTitle>
          <DialogDescription>{{ t('nav.description') }}</DialogDescription>
        </VisuallyHidden>
        <div
          class="flex shrink-0 items-center justify-between border-b border-border-dark px-6 py-8"
        >
          <slot name="logo" />
          <DialogClose
            :aria-label="t('nav.closeMenu')"
            class="inline-flex min-h-11 items-center"
          >
            <X class="size-6" :stroke-width="1.5" />
          </DialogClose>
        </div>
        <div
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          data-lenis-prevent
        >
          <div
            class="flex min-h-full flex-col justify-between gap-12 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <nav :aria-label="t('nav.main')">
              <DialogClose v-for="item in navItems" :key="item.href" as-child>
                <a
                  :href="item.href"
                  class="flex min-h-20 items-center justify-between gap-6 border-b border-border-dark py-4 text-[clamp(2.5rem,1.5rem+6vw,4rem)] leading-[1.15] tracking-[-0.035em] underline-offset-[0.15em] last:border-b-0 hover:underline hover:decoration-1"
                >
                  <span>{{ item.label }}</span>
                  <span aria-hidden="true" class="text-2xl font-normal">↘</span>
                </a>
              </DialogClose>
            </nav>
            <div>
              <div class="flex items-center justify-between gap-6">
                <p class="text-sm text-foreground/65">
                  {{ t('nav.language') }}
                </p>
                <slot name="languages" />
              </div>
              <div class="mt-6 border-t border-border-dark pt-6">
                <p class="text-sm text-foreground/65">
                  {{ t('contact.email') }}
                </p>
                <DialogClose as-child>
                  <a
                    :href="`mailto:${email}`"
                    class="mt-1 inline-flex min-h-11 items-center text-xl tracking-tight underline-offset-4 hover:underline"
                  >
                    {{ email }}
                  </a>
                </DialogClose>
              </div>
              <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <DialogClose
                  v-for="social in socialMediaLinks"
                  :key="social.label"
                  as-child
                >
                  <a
                    :href="social.to"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-11 items-center gap-1 text-sm underline-offset-4 hover:underline"
                  >
                    {{ social.label }}<span aria-hidden="true">↗</span>
                  </a>
                </DialogClose>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
