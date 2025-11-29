// @ts-check
import vercel from '@astrojs/vercel'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import { defineConfig, fontProviders } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  integrations: [playformCompress(), icon()],
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
