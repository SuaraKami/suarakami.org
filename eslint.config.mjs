import { defineConfig } from "./packages/eslint-config/dist/index.js";

export default defineConfig({
  astro: false,
  vue: false,
  svelte: false,
  tailwind: false,
});
