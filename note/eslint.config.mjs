import baseConfig from "@suarakami/eslint-config";

export default baseConfig({
  tailwind: {
    entry: "src/styles/global.css",
    astro: true,
    svelte: true,
  },
});
