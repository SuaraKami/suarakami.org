import { defineConfig } from 'oxlint'
import antiSlop from 'ultracite/oxlint/anti-slop'
import astro from 'ultracite/oxlint/astro'
import core from 'ultracite/oxlint/core'
import svelte from 'ultracite/oxlint/svelte'
import vue from 'ultracite/oxlint/vue'

export default defineConfig({
  categories: {},
  env: {
    builtin: true,
  },
  extends: [core, antiSlop, vue, svelte, astro],
  globals: {},
  ignorePatterns: core.ignorePatterns,
  overrides: [
    {
      files: ['note/src/assets/scripts/**/*.ts'],
      rules: {
        // Astro processes local client scripts as modules before serving them.
        'eslint/no-implicit-globals': 'off',
      },
    },
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
