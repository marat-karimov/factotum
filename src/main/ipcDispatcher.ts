import { BrowserWindow } from "electron";
import { IpcChannels, IpcDataTypes } from "../types/types";

export function sendAppendToLogs(
  mainWindow: BrowserWindow,
  data: IpcDataTypes[IpcChannels.AppendToLogs]
) {
  mainWindow.webContents.send(IpcChannels.AppendToLogs, data);
}

export function sendRenderCurrentEngine(
  mainWindow: BrowserWindow,
  engine: IpcDataTypes[IpcChannels.RenderCurrentEngine]
) {
  mainWindow.webContents.send(IpcChannels.RenderCurrentEngine, engine);
}

export function sendAppendToEditor(
  mainWindow: BrowserWindow,
  sql: IpcDataTypes[IpcChannels.AppendToEditor]
) {
  mainWindow.webContents.send(IpcChannels.AppendToEditor, sql);
}

export function sendRenderMemoryUsage(
  mainWindow: BrowserWindow,
  memoryUsage: IpcDataTypes[IpcChannels.RenderMemoryUsage]
) {
  mainWindow.webContents.send(IpcChannels.RenderMemoryUsage, memoryUsage);
}

export function sendRenderSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(IpcChannels.RenderSearchBox);
}

export function sendHideSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(IpcChannels.HideSearchBox);
}

export function sendRenderTable(
  mainWindow: BrowserWindow,
  data: IpcDataTypes[IpcChannels.RenderTable]
) {
  mainWindow.webContents.send(IpcChannels.RenderTable, data);
}

export function sendRenderEmptyState(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(IpcChannels.RenderEmptyState);
}

export function sendUpdateDatabaseSchema(
  mainWindow: BrowserWindow,
  schema: IpcDataTypes[IpcChannels.UpdateDatabaseSchema]
) {
  mainWindow.webContents.send(IpcChannels.UpdateDatabaseSchema, schema);
}

export function sendGetSqlToRun(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(IpcChannels.GetSqlToRun);
}

export function sendValidInput(
  mainWindow: BrowserWindow,
  validInput: IpcDataTypes[IpcChannels.ValidInput]
) {
  mainWindow.webContents.send(IpcChannels.ValidInput, validInput);
}

export function sendInvalidInput(
  mainWindow: BrowserWindow,
  invalidInput: IpcDataTypes[IpcChannels.InvalidInput]
) {
  mainWindow.webContents.send(IpcChannels.InvalidInput, invalidInput);
}

export function sendRenderSpinner(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(IpcChannels.RenderSpinner);
}

export function sendRenderLastTable(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(IpcChannels.RenderLastTable);
}
