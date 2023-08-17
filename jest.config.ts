/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";

const config: Config = {

  testTimeout: 10000,

  coverageProvider: "v8",

  maxWorkers: 1,

  preset: "ts-jest",

  testMatch: ["**/tests/api/**/*.spec.ts"],

  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};

export default config;
