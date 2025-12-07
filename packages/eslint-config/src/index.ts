import type { Linter } from "eslint";
import { astroRules, type AstroConfigOptions } from "./configs/astro.ts";
import { svelteRules, type SvelteConfigOptions } from "./configs/svelte.ts";
import { tailwindRules, type TailwindConfigOptions } from "./configs/tailwind.ts";
import { vueRules, type VueConfigOptions } from "./configs/vue.ts";
import { normalizeOptions, toArray, type MaybeArray } from "./utils.ts";

const defaultIgnores = [
  "**/node_modules/**",
  "**/.astro/**",
  "**/.svelte-kit/**",
  "**/.vercel/**",
  "**/.output/**",
  "**/dist/**",
] as const;

export interface DefineConfigOptions {
  ignores?: MaybeArray<string> | false;
  astro?: boolean | AstroConfigOptions;
  vue?: boolean | VueConfigOptions;
  svelte?: boolean | SvelteConfigOptions;
  tailwind?: boolean | TailwindConfigOptions;
}

export default function baseConfig(options: DefineConfigOptions = {}): Linter.Config[] {
  const configs: Linter.Config[] = [];
  const ignores = options.ignores ?? defaultIgnores;

  if (ignores) {
    configs.push({ ignores: toArray(ignores) });
  }

  const astroOptions = normalizeOptions<AstroConfigOptions>(options.astro, true);
  if (astroOptions) {
    configs.push(astroRules(astroOptions));
  }

  const vueOptions = normalizeOptions<VueConfigOptions>(options.vue, false);
  if (vueOptions) {
    configs.push(vueRules(vueOptions));
  }

  const svelteOptions = normalizeOptions<SvelteConfigOptions>(options.svelte, false);
  if (svelteOptions) {
    configs.push(svelteRules(svelteOptions));
  }

  const tailwindOptions = normalizeOptions<TailwindConfigOptions>(options.tailwind, false);
  if (tailwindOptions) {
    configs.push(tailwindRules(tailwindOptions));
  }

  return configs;
}

export { astroRules } from "./configs/astro.ts";
export { svelteRules } from "./configs/svelte.ts";
export { tailwindRules } from "./configs/tailwind.ts";
export { vueRules } from "./configs/vue.ts";
