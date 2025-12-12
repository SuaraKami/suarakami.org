import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
import vueParser from "vue-eslint-parser";
import { type MaybeArray, toArray } from "../utils.ts";

const defaultFiles = ["**/*.vue"] as const;

export interface VueConfigOptions {
  files?: MaybeArray<string>;
  parserOptions?: Record<string, unknown>;
}

export function vueRules(options: VueConfigOptions = {}): Linter.Config {
  const files = toArray(options.files ?? defaultFiles);
  const parserOptions = {
    parser: tsParser,
    sourceType: "module",
    extraFileExtensions: [".vue"],
    ...options.parserOptions,
  };

  return {
    files,
    languageOptions: {
      parser: vueParser,
      parserOptions,
    },
  };
}
