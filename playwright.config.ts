import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  globalTimeout: 10 * 60 * 1000,
  timeout: 90000,
  reporter: "github",
  expect: {
    timeout: 10000,
  },
  use: {
    actionTimeout: 10000,
    trace: { mode: "retain-on-failure", screenshots: false },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
};

export default config;
