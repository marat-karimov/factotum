import { BrowserWindow } from "electron";

export function sendAppendToLogs(
  mainWindow: BrowserWindow,
  data: LogMessage
) {
  mainWindow.webContents.send("appendToLogs", data);
}

export function sendRenderCurrentEngine(
  mainWindow: BrowserWindow,
  engine: Engine
) {
  mainWindow.webContents.send("renderCurrentEngine", engine);
}

export function sendAppendToEditor(mainWindow: BrowserWindow, sql: string) {
  mainWindow.webContents.send("appendToEditor", sql);
}

export function sendRenderMemoryUsage(
  mainWindow: BrowserWindow,
  memoryUsage: string
) {
  mainWindow.webContents.send("renderMemoryUsage", memoryUsage);
}

export function sendRenderSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send("renderSearchBox");
}

export function sendHideSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send("hideSearchBox");
}

export function sendRenderTable(
  mainWindow: BrowserWindow,
  data: TableForRender
) {
  mainWindow.webContents.send("renderTable", data);
}

export function sendRenderEmptyState(mainWindow: BrowserWindow) {
  mainWindow.webContents.send("renderEmptyState");
}

export function sendUpdateDatabaseSchema(
  mainWindow: BrowserWindow,
  schema: DataBaseSchema
) {
  mainWindow.webContents.send("updateDatabaseSchema", schema);
}

export function sendGetSqlToRun(mainWindow: BrowserWindow) {
  mainWindow.webContents.send("getSqlToRun");
}

export function sendValidInput(
  mainWindow: BrowserWindow,
  validInput: ValidInput
) {
  mainWindow.webContents.send("validInput", validInput);
}

export function sendInvalidInput(
  mainWindow: BrowserWindow,
  invalidInput: InvalidInput
) {
  mainWindow.webContents.send("invalidInput", invalidInput);
}

export function sendRenderSpinner(mainWindow: BrowserWindow) {
  mainWindow.webContents.send("renderSpinner");
}

export function sendRenderLastTable(mainWindow: BrowserWindow) {
  mainWindow.webContents.send("renderLatestRenderedTable");
}
