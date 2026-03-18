import vercel from '@astrojs/vercel'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  experimental: {
    fonts: [
      {
        cssVariable: '--font-geist',
        name: 'Geist',
        provider: fontProviders.google(),
        styles: ['normal'],
        weights: ['300'],
      },
      {
        cssVariable: '--font-ibm-mono',
        name: 'IBM Plex Mono',
        provider: fontProviders.google(),
        styles: ['normal'],
        weights: ['300'],
      },
    ],
  },
  integrations: [playformCompress(), icon()],
  site: 'https://bio.suarakami.org',
  vite: {
    plugins: [tailwindcss()],
  },
})
