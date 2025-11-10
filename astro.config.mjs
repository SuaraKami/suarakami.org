// @ts-check
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://suarakami.org',
  integrations: [
    sitemap(),
    vue({ appEntrypoint: '/src/_app' }),
    playformCompress(),
  ],
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
        provider: 'local',
        name: 'Cabinet Grotesk',
        cssVariable: '--font-cabinet',
        variants: [
          {
            weight: 300,
            style: 'normal',
            src: ['./src/assets/fonts/CabinetGrotesk-Light.woff2'],
          },
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/CabinetGrotesk-Regular.woff2'],
          },
          {
            weight: 500,
            style: 'normal',
            src: ['./src/assets/fonts/CabinetGrotesk-Medium.woff2'],
          },
        ],
      },
      {
        provider: 'local',
        name: 'IBM Plex Mono',
        cssVariable: '--font-ibm-mono',
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/IBMPlexMono-Regular.woff2'],
          },
        ],
      },
    ],
  },
})
