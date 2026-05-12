import { defineConfig } from 'oxlint'
import astro from 'ultracite/oxlint/astro'
import core from 'ultracite/oxlint/core'
import svelte from 'ultracite/oxlint/svelte'
import vue from 'ultracite/oxlint/vue'

export default defineConfig({
  categories: {},
  env: {
    builtin: true,
  },
  extends: [core, vue, svelte, astro],
  globals: {},
  ignorePatterns: [],
  overrides: [
    {
      files: ['*.svelte'],
      rules: {
        'prefer-const': 'off',
      },
    },
    {
      files: ['*.vue'],
      rules: {
        'vue/max-props': 'off',
      },
    },
  ],
  rules: {
    'func-style': 'off',
    'prefer-destructuring': 'off',
    'unicorn/prefer-array-find': 'off',
  },
})
