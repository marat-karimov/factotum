import { test, expect } from "@playwright/test";
import {
  clickMenuItemById,
  findLatestBuild,
  parseElectronApp,
  stubDialog,
} from "electron-playwright-helpers";

import { _electron as electron } from "playwright-core";

import { messages } from "../../src/messages";

test("File import", async () => {
  const { app, page } = await setup();

  await expect(
    page.locator('span:text("--Your SQL editor is here")')
  ).toBeVisible();

  await expect(page.locator("text=Virtual database schema is here")).toBeVisible({
    timeout: 20000,
  });
  await expect(page.locator(`text=${messages.welcome}`)).toBeVisible();
  await expect(page.locator("text=SQL engine: polars")).toBeVisible();
  await expect(page.locator("text=RAM usage:")).toBeVisible();

  await stubDialog(app, "showOpenDialog", {
    filePaths: ["./tests/assets/test.csv"],
  });

  await clickMenuItemById(app, "import-files");

  await expect(
    page.locator("text=SELECT * FROM test LIMIT 100;")
  ).toHaveCount(2);

});

async function setup() {
  const latestBuild = findLatestBuild("dist");
  console.log(latestBuild);

  const appInfo = parseElectronApp(latestBuild);
  console.log(appInfo);

  const app = await electron.launch({
    tracesDir: 'trace',
    executablePath: appInfo.executable,
    timeout: 90000,
  });

  const page = await app.firstWindow();

  await page.context().tracing.start({ screenshots: true, snapshots: true });

  return { app, page };
}
