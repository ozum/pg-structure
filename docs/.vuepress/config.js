const packageData = require("../../package.json");
const getVuePressBars = require("vuepress-bar");
const { nav, sidebar } = getVuePressBars(__dirname + "/..");

module.exports = {
  title: packageData.label || packageData.name,
  description: packageData.description,
  plugins: ["@vuepress/active-header-links", "@vuepress/plugin-pwa"],
  themeConfig: {
    repo: typeof packageData.repository === "string" ? packageData.repository : packageData.repository.url,
    nav,
    sidebar,
    sidebarDepth: 2,
  },
};
