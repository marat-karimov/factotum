import { test, expect } from "@playwright/test";
import {
  clickMenuItemById,
  findLatestBuild,
  parseElectronApp,
  stubDialog,
} from "electron-playwright-helpers";

import { _electron as electron } from "playwright";

test.only("file import", async () => {
  const { app, page } = await setup();

  await expect(
    page.locator('span:text("--Your SQL editor is here")')
  ).toBeVisible();

  await expect(page.locator("text=Virtual database schema here")).toBeVisible();
  await expect(page.locator("text=data will be displayed here")).toBeVisible();
  await expect(page.locator("text=Import files to start")).toBeVisible();
  await expect(page.locator("text=SQL engine: polars")).toBeVisible();
  await expect(page.locator("text=RAM usage:")).toBeVisible();

  await stubDialog(app, "showOpenDialog", {
    filePaths: ["./tests/assets/Automobile.csv"],
  });

  await clickMenuItemById(app, "import-files");

  await expect(page.locator("text=SELECT * FROM Automobile LIMIT 100;")).toBeVisible();

});

async function setup() {
  const latestBuild = findLatestBuild();

  const appInfo = parseElectronApp(latestBuild);

  const app = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable,
  });

  const page = await app.firstWindow();

  return { app, page };
}
