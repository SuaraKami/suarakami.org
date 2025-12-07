import type { MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";
import type { LanguageKeys } from "@/i18n";
import { siteConfig } from "@/site.config";

export interface FormatDateOptions {
  localeMatcher?: "best fit" | "lookup";
  weekday?: "long" | "short" | "narrow";
  era?: "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  timeZoneName?:
    | "short"
    | "long"
    | "shortOffset"
    | "longOffset"
    | "shortGeneric"
    | "longGeneric";
  formatMatcher?: "best fit" | "basic";
  hour12?: boolean;
  timeZone?: string;

  calendar?: string;
  dayPeriod?: "narrow" | "short" | "long";
  numberingSystem?: string;

  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  hourCycle?: "h11" | "h12" | "h23" | "h24";
}

export function useFormatDate(
  datetime: MaybeRefOrGetter<string | number | Date>,
  lang?: MaybeRefOrGetter<LanguageKeys>,
  options?: MaybeRefOrGetter<FormatDateOptions>
) {
  const date = computed(() => {
    const dt = toValue(datetime);
    return dt instanceof Date ? dt : new Date(dt);
  });

  const formattedDate = computed(() => {
    const { languages, defaultLang } = siteConfig.i18n;
    const locale = languages[toValue(lang) ?? defaultLang].code;
    const formatOptions = toValue(options) ?? {};
    return date.value.toLocaleDateString(locale, formatOptions);
  });

  const isoDate = computed(() => date.value.toISOString());

  return {
    date,
    formattedDate,
    isoDate,
  };
}
