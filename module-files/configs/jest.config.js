const ignorePatterns = [".nosync", "<rootDir>/dist/", "<rootDir>/node_modules/", "/test-helper/", "/__test__/"];

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ignorePatterns,
  coveragePathIgnorePatterns: ignorePatterns,
  coverageThreshold: { global: { branches: 100, functions: 100, lines: 100, statements: 100 } },
  modulePathIgnorePatterns: ["<rootDir>/node_modules.nosync/"],
};
