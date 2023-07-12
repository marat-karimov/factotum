import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  globalTimeout: 10 * 60 * 1000,
  timeout: 90000,
  reporter: 'github'
};

export default config;
