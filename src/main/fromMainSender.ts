import { BrowserWindow } from "electron";
import {
  FromMainToRenderer,
  FromMainDataTypes,
  FromMainToPreloader,
} from "../types/types";

export function sendAppendToLogs(
  mainWindow: BrowserWindow,
  data: FromMainDataTypes[FromMainToRenderer.AppendToLogs]
) {
  mainWindow.webContents.send(FromMainToRenderer.AppendToLogs, data);
}

export function sendRenderCurrentEngine(
  mainWindow: BrowserWindow,
  engine: FromMainDataTypes[FromMainToRenderer.RenderCurrentEngine]
) {
  mainWindow.webContents.send(FromMainToRenderer.RenderCurrentEngine, engine);
}

export function sendAppendToEditor(
  mainWindow: BrowserWindow,
  sql: FromMainDataTypes[FromMainToRenderer.AppendToEditor]
) {
  mainWindow.webContents.send(FromMainToRenderer.AppendToEditor, sql);
}

export function sendRenderMemoryUsage(
  mainWindow: BrowserWindow,
  memoryUsage: FromMainDataTypes[FromMainToRenderer.RenderMemoryUsage]
) {
  mainWindow.webContents.send(
    FromMainToRenderer.RenderMemoryUsage,
    memoryUsage
  );
}

export function sendRenderSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainToRenderer.RenderSearchBox);
}

export function sendHideSearchBox(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainToRenderer.HideSearchBox);
}

export function sendRenderTable(
  mainWindow: BrowserWindow,
  data: FromMainDataTypes[FromMainToRenderer.RenderTable]
) {
  mainWindow.webContents.send(FromMainToRenderer.RenderTable, data);
}

export function sendRenderEmptyState(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainToRenderer.RenderEmptyState);
}

export function sendUpdateDatabaseSchema(
  mainWindow: BrowserWindow,
  schema: FromMainDataTypes[FromMainToRenderer.UpdateDatabaseSchema]
) {
  mainWindow.webContents.send(FromMainToRenderer.UpdateDatabaseSchema, schema);
}

export function sendGetSqlToRun(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainToRenderer.GetSqlToRun);
}

export function sendValidInput(
  mainWindow: BrowserWindow,
  validInput: FromMainDataTypes[FromMainToRenderer.ValidInput]
) {
  mainWindow.webContents.send(FromMainToRenderer.ValidInput, validInput);
}

export function sendInvalidInput(
  mainWindow: BrowserWindow,
  invalidInput: FromMainDataTypes[FromMainToRenderer.InvalidInput]
) {
  mainWindow.webContents.send(FromMainToRenderer.InvalidInput, invalidInput);
}

export function sendRenderSpinner(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainToRenderer.RenderSpinner);
}

export function sendRenderLastTable(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainToRenderer.RenderLastTable);
}

export function sendRefreshMenu(mainWindow: BrowserWindow) {
  mainWindow.webContents.send(FromMainToPreloader.RefreshMenu);
}
