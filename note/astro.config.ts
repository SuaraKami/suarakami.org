import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import icon from 'astro-icon'
import { rehypeGlossaryHighlight } from './src/lib/rehype/glossary-highlight'

// https://astro.build/config
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  markdown: {
    rehypePlugins: [rehypeGlossaryHighlight],
  },
  integrations: [
    svelte(),
    icon(),
    playformCompress({
      HTML: {
        'html-minifier-terser': {
          collapseWhitespace: false,
          collapseInlineTagWhitespace: false,
        },
      },
    }),
  ],
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
