import { BrowserWindow } from "electron";
import {
  sendAppendToLogs,
  sendInvalidInput,
  sendRenderEmptyState,
  sendRefreshMenu,
  sendRenderSpinner,
  sendRenderTable,
  sendUpdateDatabaseSchema,
  sendValidInput,
} from "./fromMainSender";
import { sendGetSchema, sendRunSql, sendValidate } from "./requestDispatcher";
import { TableForRender } from "../types/types";
import { messages } from "../messages";

export class SqlHandler {
  private win: BrowserWindow;
  private mainMenu: Electron.Menu;

  constructor(mainWindow: BrowserWindow) {
    this.win = mainWindow;
  }

  public setMainMenu(mainMenu: Electron.Menu) {
    this.mainMenu = mainMenu;
  }

  public handleSqlToValidate = async (
    _: Electron.IpcMainEvent,
    data: string
  ) => {
    const { result, sql, last_statement, error } = await sendValidate(data);

    if (result) {
      sendValidInput(this.win, { sql, last_statement });
      return;
    }

    sendInvalidInput(this.win, { sql, error });
  };

  public handleSqlToRun = async (_: Electron.IpcMainEvent, sql: string) => {
    sendRenderSpinner(this.win);

    const { tableData, columns, error } = await sendRunSql(sql);

    if (error) {
      sendAppendToLogs(this.win, { message: error, kind: "error" });
      sendRenderEmptyState(this.win);
      return;
    }

    await this.handleSqlSuccess(sql, { tableData, columns });
  };

  private handleSqlSuccess = async (sql: string, tableData: TableForRender) => {
    const message = messages.sqlSuccess(sql);
    sendAppendToLogs(this.win, { message, kind: "success" });

    await this.updateDatabaseInfo();

    if (!tableData.tableData) {
      sendRenderEmptyState(this.win);
      this.updateExportFileMenuItemEnabledState(false);
      return;
    }

    sendRenderTable(this.win, tableData);
    this.updateExportFileMenuItemEnabledState(true);
    sendRefreshMenu(this.win)
  };

  private updateExportFileMenuItemEnabledState(value: boolean) {
    this.mainMenu.getMenuItemById("export-file").enabled = value;
  }

  public async updateDatabaseInfo() {
    const { schema } = await sendGetSchema();

    sendUpdateDatabaseSchema(this.win, schema);
  }
}
