<script lang="ts" setup>
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
  } from "reka-ui";
  import type { LanguageKeys } from "@/i18n";
  import { useTranslations } from "@/i18n";
  import { siteConfig } from "@/site.config";
  import Languages from "~icons/lucide/languages";
  import Mail from "~icons/lucide/mail";
  import X from "~icons/lucide/x";
  import LanguagePicker from "./LanguagePicker.vue";
  import LinkLocal from "./LinkLocal.vue";
  import TimeLocal from "./TimeLocal.vue";

  const { lang } = defineProps<{
    lang: LanguageKeys;
  }>();

  const { navigation, socialMediaLinks, email, footer } = siteConfig;
  const t = useTranslations(lang);
</script>

<template>
  <DialogRoot>
    <DialogTrigger
      aria-label="Open menu"
      class="transition-opacity hover:opacity-50 md:hidden"
    >
      <svg viewBox="0 0 24 24" class="size-6" stroke-width="1.5">
        <path
          stroke="currentColor"
          stroke-linecap="round"
          d="M0 5h24M0 12h24M0 19h24"
        />
      </svg>
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay
        class="
          fixed inset-0 z-50 bg-black/80
          data-[state=closed]:animate-out data-[state=closed]:duration-[calc(var(--duration-circle-out)+100ms)]
          data-[state=closed]:fade-out
          data-[state=open]:animate-in data-[state=open]:duration-(--duration-circle-in) data-[state=open]:ease-in-out
          data-[state=open]:fade-in
        "
      />
      <DialogContent
        class="
          group fixed inset-0 z-50 bg-background
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
        <div
          class="
            flex h-full flex-col
            group-data-[state=closed]:animate-out
            group-data-[state=closed]:duration-[calc(var(--duration-circle-out)+100ms)]
            group-data-[state=closed]:fade-out
            group-data-[state=open]:animate-in group-data-[state=open]:duration-(--duration-circle-in)
            group-data-[state=open]:fade-in
          "
        >
          <div
            class="flex items-center justify-between border-b border-border-dark px-6 py-8"
          >
            <slot name="logo"/>
            <DialogClose as-child>
              <button
                aria-label="Close menu"
                class="transition-opacity hover:opacity-50"
              >
                <X class="size-6" :stroke-width="1.5"/>
              </button>
            </DialogClose>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="grid h-full grid-cols-12 gap-0">
              <DialogClose as-child>
                <LinkLocal
                  :href="navigation[0]!.to"
                  class="
                    group col-span-12 flex flex-col justify-between border-b border-border-dark p-6 transition-colors
                    hover:bg-foreground/5
                  "
                >
                  <span class="text-xs tracking-widest uppercase opacity-20"
                    >01</span
                  >
                  <div>
                    <h2
                      class="text-5xl font-semibold tracking-tight transition-transform group-hover:translate-x-2"
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
                    group relative col-span-7 flex flex-col justify-between overflow-hidden p-6 transition-colors
                    hover:bg-foreground/5
                  "
                >
                  <div
                    class="
                      absolute top-0 right-0 size-16 translate-x-8 -translate-y-8 rotate-45 bg-accent-foreground/10
                    "
                  />
                  <span class="text-xs tracking-widest uppercase opacity-20"
                    >02</span
                  >
                  <div>
                    <h2
                      class="text-4xl font-semibold tracking-tight transition-transform group-hover:translate-x-2"
                    >
                      {{ t(`nav.${navigation[1]!.code}`) }}
                    </h2>
                  </div>
                </LinkLocal>
              </DialogClose>
              <div
                class="col-span-5 flex flex-col justify-between border-l border-border-dark p-6"
              >
                <Languages class="size-4 opacity-20"/>
                <LanguagePicker
                  class="space-y-3"
                  lang-class="block text-2xl tracking-tight uppercase opacity-30 transition-opacity hover:opacity-60"
                  active-lang-class="opacity-100"
                />
              </div>

              <DialogClose as-child>
                <LinkLocal
                  :href="navigation[2]!.to"
                  class="
                    group col-span-7 flex flex-col justify-between border-t border-border-dark p-6 transition-colors
                    hover:bg-foreground/5
                  "
                >
                  <span class="text-xs tracking-widest uppercase opacity-20"
                    >03</span
                  >
                  <div>
                    <h2
                      class="text-4xl font-semibold tracking-tight transition-transform group-hover:translate-x-2"
                    >
                      {{ t(`nav.${navigation[2]!.code}`) }}
                    </h2>
                  </div>
                </LinkLocal>
              </DialogClose>
              <div
                class="
                  relative col-span-5 flex flex-col justify-between border-t border-l border-border-dark
                  bg-accent-foreground/5 p-6
                "
              >
                <div
                  class="absolute top-6 bottom-6 left-0 w-0.5 bg-accent-foreground"
                />
                <Mail class="size-4 opacity-20"/>
                <div class="space-y-2">
                  <p class="text-xs tracking-widest uppercase opacity-40">
                    {{ t('contact.email') }}
                  </p>
                  <DialogClose as-child>
                    <a
                      :href="`mailto:${email}`"
                      rel="noopener noreferrer"
                      target="_blank"
                      class="block text-sm break-all transition-opacity hover:opacity-50"
                    >
                      {{ email }}
                    </a>
                  </DialogClose>
                </div>
              </div>
              <div class="col-span-12 border-t border-border-dark p-6">
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
                        flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity
                        hover:opacity-50
                      "
                    >
                      <span class="size-1 rounded-full bg-foreground"/>
                      {{ social.label }}
                    </a>
                  </DialogClose>
                </div>
              </div>
              <div
                class="relative col-span-12 overflow-hidden bg-foreground p-6 text-background"
              >
                <div
                  class="absolute top-1/2 right-6 -translate-y-1/2 text-[120px] leading-none opacity-10"
                >
                  <TimeLocal :lang :datetime="Date.now()" year="2-digit"/>
                </div>
                <p class="relative z-10 text-xs tracking-widest uppercase">
                  {{ footer.tagline }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
