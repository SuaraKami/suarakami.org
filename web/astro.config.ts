import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import vue from '@astrojs/vue'
import keystatic from '@keystatic/astro'
import playformCompress from '@playform/compress'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  compressHTML: true,
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
    vue({ appEntrypoint: '/src/_app' }),
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
      Icons({ compiler: 'vue3' }),
      // Workaround, because `exclude` not honored in react() plugin.
      {
        applyToEnvironment: (environment) =>
          environment.config.consumer === 'server',
        enforce: 'post',
        name: 'stub-react-refresh-on-server',
        transform: (code: string) =>
          code.includes('$RefreshSig$')
            ? {
                code: `const $RefreshSig$ = () => (type) => type\n${code}`,
                map: null,
              }
            : undefined,
      },
    ],
  },
})
