import type { Linter } from "eslint";
import tsParser from "@typescript-eslint/parser";
import astroParser from "astro-eslint-parser";
import { toArray, type MaybeArray } from "../utils.ts";

const defaultFiles = ["**/*.astro"] as const;

export interface AstroConfigOptions {
  files?: MaybeArray<string>;
  parserOptions?: Record<string, unknown>;
}

export function astroRules(options: AstroConfigOptions = {}): Linter.FlatConfig {
  const files = toArray(options.files ?? defaultFiles);
  const parserOptions = {
    parser: tsParser,
    extraFileExtensions: [".astro"],
    sourceType: "module",
    ...options.parserOptions,
  };

  return {
    files,
    languageOptions: {
      parser: astroParser,
      parserOptions,
    },
  };
}
