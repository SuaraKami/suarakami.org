import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import keystatic from '@keystatic/astro'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  fonts: [
    {
      cssVariable: '--font-cabinet',
      name: 'Cabinet Grotesk',
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/CabinetGrotesk-Variable.woff2'],
            style: 'normal',
            weight: '400 900',
          },
        ],
      },
      provider: fontProviders.local(),
    },
  ],
  integrations: [
    react(),
    keystatic(),
    sitemap(),
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
  site: 'https://suarakami.org',
  vite: {
    plugins: [
      tailwindcss(),
      Icons({ compiler: 'jsx', jsx: 'react' }),
    ],
  },
})
