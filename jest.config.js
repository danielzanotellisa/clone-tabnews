const nextJest = require("next/jest");

const createJestConfig = nextJest();
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  setupFiles: ["<rootDir>/jest.setup.js"],
});

module.exports = jestConfig;
