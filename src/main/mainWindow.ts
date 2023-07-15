import { BrowserWindow } from "electron";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      enableBlinkFeatures: "CSSColorSchemeUARendering",
    },
    width: 800,
    darkTheme: true,
  });

  // and load the index.html of the app.
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools();
  }
  return win
}
