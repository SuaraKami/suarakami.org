import antfu from '@antfu/eslint-config'
import eslintParserAstro from 'astro-eslint-parser'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import {
  getDefaultAttributes,
} from 'eslint-plugin-better-tailwindcss/api/defaults'
import eslintParserVue from 'vue-eslint-parser'

export default antfu(
  {
    astro: true,
    formatters: true,
    typescript: true,
    vue: true,
  },
  {
    files: ['**/*.vue'],
    rules: {
      'import/first': 'off',
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: eslintParserAstro,
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: eslintParserVue,
    },
  },
  {
    plugins: {
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': ['warn', {
        preferSingleLine: true,
      }],
      'better-tailwindcss/enforce-consistent-class-order': ['warn', {
        order: 'improved',
      }],
      'better-tailwindcss/no-unregistered-classes': 'warn',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
        attributes: [...getDefaultAttributes(), '.*Class', '.*-class'],
      },
    },
  },
)
