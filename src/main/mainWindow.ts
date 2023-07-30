import { BrowserWindow } from "electron";
import {
  setupTitlebar,
  attachTitlebarToWindow,
} from "custom-electron-titlebar/main";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

setupTitlebar();

export function createWindow() {
  const win = new BrowserWindow({
    height: 600,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      enableBlinkFeatures: "CSSColorSchemeUARendering",
      nodeIntegration: true,
      contextIsolation: true,
    },
    width: 800,
    darkTheme: true,
  });

  // and load the index.html of the app.
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }

  win.setMenuBarVisibility(false)
  attachTitlebarToWindow(win);
  return win;
}
