// @ts-check
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://suarakami.netlify.app/',
  integrations: [mdx(), sitemap(), vue()],
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
