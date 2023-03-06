/**
 * @type {import('jest').Config}
 */
module.exports = {
  verbose: true,
  testEnvironment: "node",
  testRegex: "\\.test\\.ts$",
  transform: {
    "^.+\\.ts?$": "esbuild-jest",
  },
};
