# @suarakami/eslint-config

Shared ESLint helpers for every workspace in the monorepo.

```js
// eslint.config.mjs inside any workspace
import baseConfig from "@suarakami/eslint-config";

export default baseConfig({
  tailwind: {
    entry: "src/styles/global.css",
    astro: true,
    vue: true,
    svelte: false,
  },
});
```
