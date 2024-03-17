/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 60,
  experimentalTernaries: true,
  tabWidth: 2,
};

export default config;
