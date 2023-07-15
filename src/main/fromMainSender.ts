import { BrowserWindow } from "electron";
import { FromMainChannels, FromMainDataTypes } from "../types/types";

export function sendAppendToLogs(
  mainWindow: BrowserWindow,
  data: FromMainDataTypes[FromMainChannels.AppendToLogs]
) {
  mainWindow.webContents.send(FromMainChannels.AppendToLogs, data);
}

export function sendRenderCurrentEngine(
  mainWindow: BrowserWindow,
  engine: FromMainDataTypes[FromMainChannels.RenderCurrentEngine]
) {
  mainWindow.webContents.send(FromMainChannels.RenderCurrentEngine, engine);
}

export function sendAppendToEditor(
  mainWindow: BrowserWindow,
  sql: FromMainDataTypes[FromMainChannels.AppendToEditor]
) {
  mainWindow.webContents.send(FromMainChannels.AppendToEditor, sql);
}

export function sendRenderMemoryUsage(
  mainWindow: BrowserWindow,
  memoryUsage: FromMainDataTypes[FromMainChannels.RenderMemoryUsage]
) {
  mainWindow.webContents.send(FromMainChannels.RenderMemoryUsage, memoryUsage);
}

export function sendRenderSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainChannels.RenderSearchBox);
}

export function sendHideSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainChannels.HideSearchBox);
}

export function sendRenderTable(
  mainWindow: BrowserWindow,
  data: FromMainDataTypes[FromMainChannels.RenderTable]
) {
  mainWindow.webContents.send(FromMainChannels.RenderTable, data);
}

export function sendRenderEmptyState(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainChannels.RenderEmptyState);
}

export function sendUpdateDatabaseSchema(
  mainWindow: BrowserWindow,
  schema: FromMainDataTypes[FromMainChannels.UpdateDatabaseSchema]
) {
  mainWindow.webContents.send(FromMainChannels.UpdateDatabaseSchema, schema);
}

export function sendGetSqlToRun(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainChannels.GetSqlToRun);
}

export function sendValidInput(
  mainWindow: BrowserWindow,
  validInput: FromMainDataTypes[FromMainChannels.ValidInput]
) {
  mainWindow.webContents.send(FromMainChannels.ValidInput, validInput);
}

export function sendInvalidInput(
  mainWindow: BrowserWindow,
  invalidInput: FromMainDataTypes[FromMainChannels.InvalidInput]
) {
  mainWindow.webContents.send(FromMainChannels.InvalidInput, invalidInput);
}

export function sendRenderSpinner(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainChannels.RenderSpinner);
}

export function sendRenderLastTable(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainChannels.RenderLastTable);
}
