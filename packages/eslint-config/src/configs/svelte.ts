import type { Linter } from "eslint";
import tsParser from "@typescript-eslint/parser";
import svelteParser from "svelte-eslint-parser";
import { toArray, type MaybeArray } from "../utils.ts";

const defaultFiles = ["**/*.svelte"] as const;

export interface SvelteConfigOptions {
  files?: MaybeArray<string>;
  parserOptions?: Record<string, unknown>;
}

export function svelteRules(options: SvelteConfigOptions = {}): Linter.FlatConfig {
  const files = toArray(options.files ?? defaultFiles);
  const parserOptions = {
    extraFileExtensions: [".svelte"],
    parser: {
      ts: tsParser,
    },
    ...options.parserOptions,
  };

  return {
    files,
    languageOptions: {
      parser: svelteParser,
      parserOptions,
    },
  };
}
