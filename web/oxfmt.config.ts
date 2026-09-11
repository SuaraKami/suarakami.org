import { defineConfig } from 'oxfmt'

import rootConfig from '../oxfmt.config.ts'

export default defineConfig({
  ...rootConfig,
  sortTailwindcss: {
    functions: ['cn'],
    preserveWhitespace: true,
    stylesheet: './src/styles/global.css',
  },
})
