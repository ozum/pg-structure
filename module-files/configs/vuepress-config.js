const getVuePressBars = require("vuepress-bar"); // eslint-disable-line import/no-extraneous-dependencies
const { join } = require("path");
const packageData = require("../../package.json");

const GOOGLE_ANALYTICS_ID = packageData.vuepress && packageData.vuepress["google-analytics-id"];

const { nav, sidebar } = getVuePressBars(join(__dirname), "../../docs/.vuepress");
const plugins = ["@vuepress/active-header-links", "@vuepress/pwa"];

if (GOOGLE_ANALYTICS_ID) plugins.push(["@vuepress/google-analytics", { ga: GOOGLE_ANALYTICS_ID }]);

module.exports = {
  title: packageData.label || packageData.name,
  description: packageData.description,
  plugins,
  themeConfig: {
    repo: typeof packageData.repository === "string" ? packageData.repository : packageData.repository.url,
    nav,
    sidebar,
    sidebarDepth: 2,
  },
};
