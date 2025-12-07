# @suarakami/eslint-config

Shared ESLint helpers for every workspace in the monorepo.

```js
// eslint.config.mjs inside any workspace
import { defineConfig } from "../packages/eslint-config/dist/index.js";

export default defineConfig({
  astro: true,
  vue: true,
  svelte: false,
  tailwind: {
    entry: "src/styles/global.css",
  },
});
```
