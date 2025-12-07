import baseConfig from "@suarakami/eslint-config";

export default baseConfig({
  astro: true,
  svelte: true,
  tailwind: {
    entry: "src/styles/global.css",
  },
});
