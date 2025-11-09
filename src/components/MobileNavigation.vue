<script lang="ts" setup>
import type { LanguageKeys } from '@/i18n'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger, VisuallyHidden } from 'reka-ui'
import Languages from '~icons/lucide/languages'
import Mail from '~icons/lucide/mail'
import Menu from '~icons/lucide/menu'
import X from '~icons/lucide/x'
import { useTranslations } from '@/i18n'
import { siteConfig } from '@/site.config'
import LinkLocal from './LinkLocal.vue'

const { lang } = defineProps<{
  lang: LanguageKeys
}>()

const { navigation, socialMediaLinks, email } = siteConfig
const t = useTranslations(lang)
</script>

<template>
  <DialogRoot>
    <DialogTrigger
      aria-label="Open menu"
      class="transition-opacity hover:opacity-50 md:hidden"
    >
      <Menu class="size-5" stroke-width="{1.5}" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay
        class="
          fixed inset-0 z-50 bg-black/80
          data-[state=closed]:animate-out
          data-[state=closed]:duration-[calc(var(--duration-circle-out)+500ms)]
          data-[state=closed]:fade-out
          data-[state=open]:animate-in
          data-[state=open]:duration-(--duration-circle-in)
          data-[state=open]:ease-in-out data-[state=open]:fade-in
        "
      />
      <DialogContent
        class="
          fixed inset-0 z-50 bg-background
          data-[state=closed]:animate-circle-out
          data-[state=open]:animate-circle-in
        "
      >
        <VisuallyHidden>
          <DialogTitle>Mobile navigation menu</DialogTitle>
          <DialogDescription>
            Navigate to different sections of the website
          </DialogDescription>
        </VisuallyHidden>
        <div class="flex h-full flex-col">
          <div
            class="
              flex items-center justify-between border-b border-border px-6 py-8
            "
          >
            <slot name="logo" />
            <DialogClose aria-label="Close" as-child>
              <button
                aria-label="Close menu" class="
                  transition-opacity
                  hover:opacity-50
                "
              >
                <X class="size-6" :stroke-width="1.5" />
              </button>
            </DialogClose>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="grid h-full grid-cols-12 gap-0">
              <DialogClose as-child>
                <LinkLocal
                  :href="navigation[0]!.to"
                  class="
                    group col-span-12 flex flex-col justify-between border-b
                    border-border p-6 transition-colors
                    hover:bg-foreground/5
                  "
                >
                  <span
                    class="
                      text-xs font-medium tracking-widest uppercase opacity-20
                    "
                  >01</span>
                  <div>
                    <h2
                      class="
                        text-5xl font-light tracking-tight transition-transform
                        group-hover:translate-x-2
                      "
                    >
                      {{ t(`nav.${navigation[0]!.code}`) }}
                    </h2>
                  </div>
                </LinkLocal>
              </DialogClose>
              <DialogClose as-child>
                <LinkLocal
                  :href="navigation[1]!.to"
                  class="
                    group relative col-span-7 flex flex-col justify-between
                    overflow-hidden p-6 transition-colors
                    hover:bg-foreground/5
                  "
                >
                  <div
                    class="
                      absolute top-0 right-0 h-16 w-16 translate-x-8
                      -translate-y-8 rotate-45 bg-accent-foreground/10
                    "
                  />
                  <span
                    class="
                      text-xs font-medium tracking-widest uppercase opacity-20
                    "
                  >02</span>
                  <div>
                    <h2
                      class="
                        text-4xl font-light tracking-tight transition-transform
                        group-hover:translate-x-2
                      "
                    >
                      {{ t(`nav.${navigation[1]!.code}`) }}
                    </h2>
                  </div>
                </LinkLocal>
              </DialogClose>
              <div
                class="
                  col-span-5 flex flex-col justify-between border-l
                  border-border p-6
                "
              >
                <Languages class="size-4 opacity-20" />
                <slot name="language-picker" />
              </div>

              <DialogClose as-child>
                <LinkLocal
                  :href="navigation[2]!.to"
                  class="
                    group col-span-7 flex flex-col justify-between border-t
                    border-border p-6 transition-colors
                    hover:bg-foreground/5
                  "
                >
                  <span
                    class="
                      text-xs font-medium tracking-widest uppercase opacity-20
                    "
                  >03</span>
                  <div>
                    <h2
                      class="
                        text-4xl font-light tracking-tight transition-transform
                        group-hover:translate-x-2
                      "
                    >
                      {{ t(`nav.${navigation[2]!.code}`) }}
                    </h2>
                  </div>
                </LinkLocal>
              </DialogClose>
              <div
                class="
                  relative col-span-5 flex flex-col justify-between border-t
                  border-l border-border bg-accent-foreground/5 p-6
                "
              >
                <div
                  class="
                    absolute top-6 bottom-6 left-0 w-0.5 bg-accent-foreground
                  "
                />
                <Mail class="size-4 opacity-20" />
                <div class="space-y-2">
                  <p
                    class="
                      text-xs font-medium tracking-widest uppercase opacity-40
                    "
                  >
                    {{ t('contact.email') }}
                  </p>
                  <DialogClose as-child>
                    <a
                      :href="`mailto:${email}`"
                      rel="noopener noreferrer"
                      target="_blank"
                      class="
                        block text-sm font-light break-all transition-opacity
                        hover:opacity-50
                      "
                    >
                      {{ email }}
                    </a>
                  </DialogClose>
                </div>
              </div>
              <div class="col-span-12 border-t border-border p-6">
                <div class="grid grid-cols-3 gap-6">
                  <DialogClose
                    v-for="social in socialMediaLinks"
                    :key="social.label"
                    as-child
                  >
                    <a
                      :href="social.to"
                      rel="noopener noreferrer"
                      target="_blank"
                      class="
                        flex items-center gap-2 text-xs font-medium
                        tracking-widest uppercase transition-opacity
                        hover:opacity-50
                      "
                    >
                      <span class="h-1 w-1 rounded-full bg-foreground" />
                      {{ social.label }}
                    </a>
                  </DialogClose>
                </div>
              </div>
              <slot name="footer" />
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
