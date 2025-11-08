// @ts-check
import vercel from '@astrojs/vercel'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://bio.suarakami.org',
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel(),
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Geist',
        cssVariable: '--font-geist',
        weights: ['400'],
        styles: ['normal'],
      },
    ],
  },
  integrations: [
    playformCompress(),
    icon(),
  ],
})
