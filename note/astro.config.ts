import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import { defineConfig, fontProviders } from 'astro/config'

import { rehypeGlossaryHighlight } from './src/lib/rehype/glossary-highlight'

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  fonts: [
    {
      cssVariable: '--font-inter',
      name: 'Inter',
      provider: fontProviders.google(),
    },
    {
      cssVariable: '--font-jetbrains-mono',
      name: 'JetBrains Mono',
      provider: fontProviders.google(),
    },
  ],
  integrations: [
    svelte(),
    icon(),
    playformCompress({
      HTML: {
        'html-minifier-terser': {
          collapseInlineTagWhitespace: false,
          collapseWhitespace: false,
          removeComments: true,
        },
      },
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeGlossaryHighlight],
  },
  vite: { plugins: [tailwindcss()] },
})
