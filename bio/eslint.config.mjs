import antfu from '@antfu/eslint-config'
import eslintParserAstro from 'astro-eslint-parser'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu(
  {
    astro: true,
    formatters: {
      astro: true,
    },
    typescript: true,
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: eslintParserAstro,
    },
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': ['warn', {
        preferSingleLine: true,
        printWidth: 100,
      }],
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
      },
    },
  },
)
