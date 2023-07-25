import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  globalTimeout: 10 * 60 * 1000,
  timeout: 120000,
  reporter: [["github"], ["html", { open: "never" }]],
  retries: 1,
  expect: {
    timeout: 10000,
  },
  use: {
    actionTimeout: 10000,
  },
};

export default config;
