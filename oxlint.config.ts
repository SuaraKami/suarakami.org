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
  ignorePatterns: [
    '.agent/**',
    '.agents/**',
    '.claude/**',
    '.codex/**',
    '.continue/**',
    '.cursor/**',
    '.gemini/**',
    '.opencode/**',
    '.pi/**',
    '.roo/**',
    '.windsurf/**',
    'tools/oxlint/anti-slop/**',
  ],
  jsPlugins: [
    {
      name: 'anti-slop',
      specifier: './tools/oxlint/anti-slop/index.ts',
    },
  ],
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
    'anti-slop/no-chained-type-assertions': 'error',
    'anti-slop/no-conditional-empty-object-spread': 'error',
    'anti-slop/no-known-value-widening': 'error',
    'anti-slop/no-module-mocking': 'error',
    'anti-slop/no-object-parameters': 'error',
    'anti-slop/no-reflect-apply': 'error',
    'anti-slop/no-reflect-get': 'error',
    'anti-slop/no-runtime-typeof': 'error',
    'anti-slop/no-shape-in-symbol-names': 'error',
    'anti-slop/no-unknown-parameters': 'error',
    'anti-slop/no-unknown-returns': 'error',
    'anti-slop/no-unknown-type-aliases': 'error',
    'anti-slop/no-unsafe-dictionary-type': 'error',
    'anti-slop/no-widen-then-assert': 'error',
    'anti-slop/require-safety-comment-for-type-assertion': 'error',
    'func-style': 'off',
    'prefer-destructuring': 'off',
    'unicorn/prefer-array-find': 'off',
  },
})
