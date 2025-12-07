import type { Linter } from "eslint";
import { type AstroConfigOptions, astroRules } from "./configs/astro.ts";
import { type SvelteConfigOptions, svelteRules } from "./configs/svelte.ts";
import {
  type TailwindConfigOptions,
  tailwindRules,
} from "./configs/tailwind.ts";
import { type VueConfigOptions, vueRules } from "./configs/vue.ts";
import { type MaybeArray, normalizeOptions, toArray } from "./utils.ts";

const defaultIgnores = [
  "**/node_modules/**",
  "**/.astro/**",
  "**/.svelte-kit/**",
  "**/.vercel/**",
  "**/.output/**",
  "**/dist/**",
] as const;

export interface TailwindFeatureOptions extends TailwindConfigOptions {
  astro?: boolean | AstroConfigOptions;
  vue?: boolean | VueConfigOptions;
  svelte?: boolean | SvelteConfigOptions;
}

export interface DefineConfigOptions {
  ignores?: MaybeArray<string> | false;
  tailwind?: boolean | TailwindFeatureOptions;
}

export default function defineConfig(
  options: DefineConfigOptions = {}
): Linter.Config[] {
  const configs: Linter.Config[] = [];
  const ignores = options.ignores ?? defaultIgnores;

  if (ignores) {
    configs.push({ ignores: toArray(ignores) });
  }

  const tailwindOptions = normalizeOptions<TailwindFeatureOptions>(
    options.tailwind,
    false
  );

  if (!tailwindOptions) {
    return configs;
  }

  const {
    astro: astroOption,
    vue: vueOption,
    svelte: svelteOption,
    ...tailwindConfig
  } = tailwindOptions;

  const astroConfig = normalizeOptions<AstroConfigOptions>(astroOption, true);
  if (astroConfig) {
    configs.push(astroRules(astroConfig));
  }

  const vueConfig = normalizeOptions<VueConfigOptions>(vueOption, false);
  if (vueConfig) {
    configs.push(vueRules(vueConfig));
  }

  const svelteConfig = normalizeOptions<SvelteConfigOptions>(
    svelteOption,
    false
  );
  if (svelteConfig) {
    configs.push(svelteRules(svelteConfig));
  }

  configs.push(tailwindRules(tailwindConfig));

  return configs;
}
