const getVuePressBars = require("vuepress-bar"); // eslint-disable-line import/no-extraneous-dependencies
const { join } = require("path");
const packageData = require("../../package.json");

const GOOGLE_ANALYTICS_ID = packageData.vuepress && packageData.vuepress["google-analytics-id"];

const { nav, sidebar } = getVuePressBars(join(__dirname, "../../docs"), { addReadMeToFirstGroup: false });
const plugins = ["@vuepress/active-header-links", "@vuepress/pwa"];

if (GOOGLE_ANALYTICS_ID) plugins.push(["@vuepress/google-analytics", { ga: GOOGLE_ANALYTICS_ID }]);

// If `addReadMeToFirstGroup` is `true`, and another link is not added API sidebar, it moves root README.md into first available section.
// Below conditional code reverses this for api section by moving README.md link from children of classes (or first section) to main section.
// if (sidebar["/nav.02.api/"][0].children) {
//   sidebar["/nav.02.api/"][0].children.shift();
//   sidebar["/nav.02.api/"].unshift("");
// }

// Find item with text "Api" and change it to "API".
nav
  .filter((item) => ["Api", "Cli"].includes(item.text))
  .map((item) => {
    item.text = item.text.toUpperCase(item.text); // eslint-disable-line no-param-reassign
    return item;
  });

module.exports = {
  title: packageData.label || packageData.name,
  description: packageData.description,
  plugins,
  themeConfig: {
    repo: typeof packageData.repository === "object" ? packageData.repository.url : packageData.repository,
    nav,
    sidebar,
    sidebarDepth: 2,
  },
};
