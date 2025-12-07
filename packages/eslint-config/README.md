# @suarakami/eslint-config

Shared ESLint helpers for Tailwind-in-SFC linting plus Antfu's markdown/yaml/jsonc
formatting + perfectionist/import/sort rules (gaps Biome can't fill yet).

```js
// eslint.config.mjs inside any workspace
import baseConfig from "@suarakami/eslint-config";

export default await baseConfig({
  tailwind: {
    entry: "src/styles/global.css",
    astro: true,
    vue: true,
    svelte: false,
  },
});
```
