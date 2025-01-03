import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  clipboard,
  globalShortcut,
} from "electron";

import * as localshortcut from "electron-localshortcut";
import { MainMenu } from "./menu";
import { spawnPythonProcess } from "./spawnPython";
import { createWindow } from "./mainWindow";
import { Engine, FromRendererToMain } from "../types/types";

import { SqlHandler } from "./sqlHandler";
import { ImportFilesHandler } from "./importFileHandler";
import { ExportFileHandler } from "./exportFileHandler";
import { Heartbeat } from "./heartbeat";
import { EngineSwitchHandler } from "./engineSwitchHandler";

import {
  sendAppendToLogs,
  sendGetSqlToRun,
  sendHideSearchBox,
  sendRenderCurrentEngine,
  sendRefreshMenu,
  sendRenderSearchBox,
} from "./fromMainSender";

import { sendKill } from "./requestDispatcher";
import { messages } from "../messages";

if (require("electron-squirrel-startup")) {
  app.quit();
}
const defaultEngine: Engine = "polars";

const server =
  process.env.NODE_ENV === "development"
    ? null
    : spawnPythonProcess(defaultEngine);

const handleSearch = async (mainWindow: BrowserWindow) => {
  sendRenderSearchBox(mainWindow);
  localshortcut.register(mainWindow, "Escape", () => {
    sendHideSearchBox(mainWindow);
  });
};

const handleRunSql = async (mainWindow: BrowserWindow) => {
  sendGetSqlToRun(mainWindow);
};

const unregisterEsc = (mainWindow: BrowserWindow) => {
  localshortcut.unregister(mainWindow, "Escape");
};

app.whenReady().then(() => {
  const mainWindow: BrowserWindow = createWindow();

  mainWindow.webContents.on("did-finish-load", () => {
    sendAppendToLogs(mainWindow, {
      message: messages.welcome,
      kind: "info",
    });
    sendRefreshMenu(mainWindow);
    sendRenderCurrentEngine(mainWindow, defaultEngine);
  });

  const sqlHandler = new SqlHandler(mainWindow);
  const importFilesHandler = new ImportFilesHandler(mainWindow, sqlHandler);
  const exportFileHandler = new ExportFileHandler(mainWindow);
  const heartbeat = new Heartbeat(mainWindow, app);
  const engineSwitch = new EngineSwitchHandler(
    mainWindow,
    defaultEngine,
    heartbeat
  );

  const mainMenuBuilder = new MainMenu({
    mainWindow,
    importFilesHandler: importFilesHandler.handleImportFile,
    exportFileHandler: exportFileHandler.handleExportFile,
    runSqlHandler: () => handleRunSql(mainWindow),
    searchHandler: () => handleSearch(mainWindow),
    engineSwitchHandler: engineSwitch.handleEngineSwitch,
  });

  const mainMenu = mainMenuBuilder.buildMenu();
  Menu.setApplicationMenu(mainMenu);
  sqlHandler.setMainMenu(mainMenu);
  engineSwitch.setMainMenu(mainMenu);

  ipcMain.on(FromRendererToMain.SqlToValidate, sqlHandler.handleSqlToValidate);
  ipcMain.on(FromRendererToMain.SqlToRun, sqlHandler.handleSqlToRun);
  ipcMain.on(
    FromRendererToMain.CopyToClipboard,
    (_: Electron.IpcMainEvent, data: string) => {
      clipboard.writeText(data);
    }
  );
  ipcMain.on(FromRendererToMain.SearchBoxHidden, () =>
    unregisterEsc(mainWindow)
  );

  if (server) {
    server.stdout.on("data", (data) => {
      if (data.toString().includes("Starting Factotum server")) {
        heartbeat.startSendingHeartbeats();
      }
    });
  }
});

app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => sendKill());
app.on("will-quit", () => globalShortcut.unregisterAll());
