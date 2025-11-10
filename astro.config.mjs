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
            weight: '400 900',
            style: 'normal',
            src: ['./src/assets/fonts/CabinetGrotesk-Variable.woff2'],
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
