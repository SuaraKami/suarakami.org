// @ts-check
import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import { defineConfig, fontProviders } from 'astro/config'
import { rehypeGlossaryHighlight } from './scripts/rehype-glossary.js'

// https://astro.build/config
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  markdown: {
    rehypePlugins: [rehypeGlossaryHighlight],
  },
  integrations: [svelte(), icon(), playformCompress()],
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Inter',
        cssVariable: '--font-inter',
      },
      {
        provider: fontProviders.google(),
        name: 'JetBrains Mono',
        cssVariable: '--font-jetbrains-mono',
      },
    ],
  },
  adapter: vercel(),
})
