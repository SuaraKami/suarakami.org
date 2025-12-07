import {
  formatters as antfuFormatters,
  ignores as antfuIgnores,
  jsonc as antfuJsonc,
  markdown as antfuMarkdown,
  yaml as antfuYaml,
  sortPackageJson,
  sortTsconfig,
} from "@antfu/eslint-config";
import { FlatConfigComposer } from "eslint-flat-config-utils";
import { type AstroConfigOptions, astroRules } from "./configs/astro.ts";
import { type SvelteConfigOptions, svelteRules } from "./configs/svelte.ts";
import {
  type TailwindConfigOptions,
  tailwindRules,
} from "./configs/tailwind.ts";
import { type VueConfigOptions, vueRules } from "./configs/vue.ts";
import { normalizeOptions } from "./utils.ts";

export interface TailwindFeatureOptions extends TailwindConfigOptions {
  astro?: boolean | AstroConfigOptions;
  vue?: boolean | VueConfigOptions;
  svelte?: boolean | SvelteConfigOptions;
}

export interface DefineConfigOptions {
  tailwind?: boolean | TailwindFeatureOptions;
}

export default function defineConfig(
  options: DefineConfigOptions = {}
): FlatConfigComposer {
  const composer = new FlatConfigComposer();

  composer.append(...getAntfuConfigs());

  const tailwindOptions = normalizeOptions<TailwindFeatureOptions>(
    options.tailwind,
    false
  );

  if (!tailwindOptions) {
    return composer;
  }

  const {
    astro: astroOption,
    vue: vueOption,
    svelte: svelteOption,
    ...tailwindConfig
  } = tailwindOptions;

  const astroConfig = normalizeOptions<AstroConfigOptions>(astroOption, false);
  if (astroConfig) {
    composer.append(astroRules(astroConfig));
  }

  const vueConfig = normalizeOptions<VueConfigOptions>(vueOption, false);
  if (vueConfig) {
    composer.append(vueRules(vueConfig));
  }

  const svelteConfig = normalizeOptions<SvelteConfigOptions>(
    svelteOption,
    false
  );
  if (svelteConfig) {
    composer.append(svelteRules(svelteConfig));
  }

  composer.append(tailwindRules(tailwindConfig));

  return composer;
}

function getAntfuConfigs() {
  return [
    antfuFormatters({
      markdown: true,
    }),
    antfuIgnores(),
    antfuJsonc(),
    antfuYaml(),
    antfuMarkdown(),
    sortPackageJson(),
    sortTsconfig(),
  ];
}
