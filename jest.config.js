const baseConfig = require("./module-files/configs/jest.config");

module.exports = {
  ...baseConfig,
  globalSetup: "<rootDir>/test/test-helper/global-setup.ts",
  globalTeardown: "<rootDir>/test/test-helper/global-teardown.ts",
};
