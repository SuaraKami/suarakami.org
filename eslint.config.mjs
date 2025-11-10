import tsParser from "@typescript-eslint/parser";
import eslintParserAstro from "astro-eslint-parser";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import { getDefaultAttributes } from "eslint-plugin-better-tailwindcss/api/defaults";
import eslintParserVue from "vue-eslint-parser";

export default [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: eslintParserVue,
      parserOptions: {
        parser: tsParser,
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: eslintParserAstro,
      parserOptions: {
        parser: tsParser,
        sourceType: "module",
        extraFileExtensions: [".astro"],
      },
    },
  },
  {
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
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
      "better-tailwindcss/no-unregistered-classes": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/global.css",
        attributes: [...getDefaultAttributes(), ".*Class", ".*-class"],
      },
    },
  },
];
