import { defineConfig } from 'oxlint'
import antiSlop from 'ultracite/oxlint/anti-slop'
import astro from 'ultracite/oxlint/astro'
import core from 'ultracite/oxlint/core'
import react from 'ultracite/oxlint/react'
import svelte from 'ultracite/oxlint/svelte'

export default defineConfig({
  categories: {},
  env: {
    builtin: true,
  },
  extends: [core, antiSlop, react, svelte, astro],
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
  ],
  rules: {
    'func-style': 'off',
    'prefer-destructuring': 'off',
    'unicorn/prefer-array-find': 'off',
  },
})
