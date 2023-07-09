import { BrowserWindow } from "electron";
import {
    sendAppendToEditor,
  sendAppendToLogs,
  sendRenderEmptyState,
  sendRenderSpinner,
} from "./ipcDispatcher";
import { sendImportFile } from "./requestDispatcher";
import { SqlHandler } from "./sqlHandler";

export class ImportFileHandler {
  private win: BrowserWindow;
  private sqlHandler: SqlHandler

  constructor(mainWindow: BrowserWindow, sqlHandler: SqlHandler) {
    this.win = mainWindow;
    this.sqlHandler = sqlHandler
  }

  public handleImportFile = async (filePath: string) => {
    sendRenderSpinner(this.win);

    const { tableName, error } = await sendImportFile(filePath);

    if (error) {
      const message = `Failed to import ${filePath} ${error}`;

      sendAppendToLogs(this.win, { message, kind: "error" });
      sendRenderEmptyState(this.win);

      return;
    }

    await this.handleImportFileSuccess(filePath, tableName);
  };

  private async handleImportFileSuccess(filePath: string, tableName: string) {
    const message = `File ${filePath} has been imported as a table with name ${tableName}`;
    const sql = `SELECT * FROM ${tableName} LIMIT 100;`;
    sendAppendToLogs(this.win, { message, kind: "success" });
    sendAppendToEditor(this.win, sql);
    await this.sqlHandler.handleSqlToRun(null, sql);
    await this.sqlHandler.updateDatabaseInfo();
  }
}
