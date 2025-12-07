import antfu from '@antfu/eslint-config'

export default antfu({
  astro: true,
  svelte: true,
  formatters: {
    astro: true,
    markdown: true,
  },
})
