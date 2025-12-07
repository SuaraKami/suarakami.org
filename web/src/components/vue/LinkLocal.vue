<script setup lang="ts">
  import { useLenis } from "lenis/vue";
  import { computed } from "vue";
  import { useBrowserUrl } from "@/composables/useBrowserUrl";
  import type { LanguageKeys } from "@/i18n";
  import { setPreferredLangCookie, useTranslatedPath } from "@/i18n";
  import { cn } from "@/lib/utils";
  import ClientOnly from "./ClientOnly.vue";

  const {
    href,
    locale,
    class: className,
    activeClass,
  } = defineProps<{
    href: string;
    locale?: LanguageKeys;
    class?: string;
    activeClass?: string;
  }>();

  const { currentUrl, currentLang } = useBrowserUrl();
  const lenis = useLenis();

  const linkData = computed(() => {
    const url = currentUrl.value;
    if (!url) {
      return { href, isActive: false, isExternal: false };
    }

    const baseOrigin = url.origin;
    const parsedUrl = new URL(href, baseOrigin);
    const isExternal = parsedUrl.origin !== baseOrigin;

    if (isExternal) {
      return {
        href,
        isActive: false,
        isExternal: true,
      };
    }

    const lang = locale ?? currentLang.value;
    const translatePath = useTranslatedPath(lang);
    const translatedPath = translatePath(parsedUrl.pathname);
    const finalHref = `${translatedPath}${parsedUrl.search}${parsedUrl.hash}`;

    const pathsMatch =
      normalizePath(translatedPath) === normalizePath(url.pathname);
    const hashesMatch = parsedUrl.hash ? parsedUrl.hash === url.hash : true;
    const isActive = pathsMatch && hashesMatch;

    return {
      href: finalHref,
      isActive,
      isExternal: false,
    };
  });

  const linkClass = computed(() =>
    activeClass
      ? cn(className, {
          [activeClass]: linkData.value.isActive,
        })
      : className
  );

  function normalizePath(pathname: string): string {
    // biome-ignore lint/performance/useTopLevelRegex: this is in top-level scope
    return pathname.replace(/\/$/, "") || "/";
  }

  function handleClick(event: MouseEvent) {
    if (locale) {
      setPreferredLangCookie(locale);
    }

    const url = currentUrl.value;
    if (!url) {
      return;
    }

    const parsedUrl = new URL(linkData.value.href, url.origin);
    const isSamePage =
      normalizePath(parsedUrl.pathname) === normalizePath(url.pathname);

    if (isSamePage && parsedUrl.hash && lenis.value) {
      event.preventDefault();
      lenis.value.scrollTo(parsedUrl.hash);
      history.pushState(null, "", parsedUrl.href);
    }
  }
</script>

<template>
  <ClientOnly>
    <template #default="{ attrs }">
      <a
        v-bind="attrs"
        :href="linkData.href"
        :class="linkClass"
        @click="handleClick"
      >
        <slot/>
      </a>
    </template>
    <template #fallback>
      <a
        v-bind="$attrs"
        :href="href"
        :class="className"
        data-allow-mismatch="attribute"
      >
        <slot/>
      </a>
    </template>
  </ClientOnly>
</template>
