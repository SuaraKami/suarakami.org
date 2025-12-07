import type { Linter } from "eslint";
import tailwindPlugin from "eslint-plugin-better-tailwindcss";
import { getDefaultAttributes } from "eslint-plugin-better-tailwindcss/api/defaults";
import { type MaybeArray, toArray } from "../utils.ts";

const defaultFiles = ["**/*.{astro,vue,svelte,js,jsx,ts,tsx}"] as const;
const defaultAttributes = [
  ...getDefaultAttributes(),
  ".*Class",
  ".*-class",
] as const;

const defaultRules: Linter.RulesRecord = {
  "better-tailwindcss/enforce-consistent-line-wrapping": "off",
  "better-tailwindcss/enforce-consistent-class-order": [
    "error",
    { order: "improved" },
  ],
  "better-tailwindcss/enforce-consistent-variable-syntax": [
    "error",
    { syntax: "shorthand" },
  ],
  "better-tailwindcss/enforce-consistent-important-position": [
    "error",
    { position: "recommended" },
  ],
  "better-tailwindcss/enforce-shorthand-classes": "error",
  "better-tailwindcss/no-duplicate-classes": "error",
  "better-tailwindcss/no-deprecated-classes": "error",
  "better-tailwindcss/no-unnecessary-whitespace": [
    "error",
    { allowMultiline: true },
  ],
  "better-tailwindcss/no-unregistered-classes": "warn",
  "better-tailwindcss/no-conflicting-classes": "error",
};

export interface TailwindConfigOptions {
  files?: MaybeArray<string>;
  attributes?: readonly string[];
  entry?: string;
  rules?: Record<string, Linter.RuleEntry>;
  settings?: Record<string, unknown>;
}

export function tailwindRules(
  options: TailwindConfigOptions = {}
): Linter.FlatConfig {
  const files = toArray(options.files ?? defaultFiles);
  const attributes = options.attributes ?? defaultAttributes;
  const entry = options.entry ?? "src/styles/global.css";
  const rules: Linter.RulesRecord = {
    ...defaultRules,
    ...(options.rules ?? {}),
  };
  const tailwindSettings = {
    entryPoint: entry,
    attributes,
    ...(options.settings ?? {}),
  };

  return {
    files,
    plugins: {
      "better-tailwindcss": tailwindPlugin,
    },
    rules,
    settings: {
      "better-tailwindcss": tailwindSettings,
    },
  };
}
