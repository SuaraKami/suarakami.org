import { defineConfig } from 'oxfmt'
import ultracite from 'ultracite/oxfmt'

export default defineConfig({
  ...ultracite,
  semi: false,
  singleQuote: true,
  sortImports: {
    groups: [
      'type-import',
      ['value-builtin', 'value-external'],
      'type-internal',
      'value-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
  },
})
