// @ts-check
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://suarakami.org',
  integrations: [sitemap(), vue(), playformCompress()],
  adapter: vercel(),
  vite: {
    plugins: [
      tailwindcss(),
      Icons({ compiler: 'vue3' }),
    ],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Geist',
        cssVariable: '--font-geist',
        weights: ['300'],
        styles: ['normal'],
      },
      {
        provider: fontProviders.google(),
        name: 'IBM Plex Mono',
        cssVariable: '--font-ibm-mono',
        weights: ['300'],
        styles: ['normal'],
      },
    ],
  },
})
