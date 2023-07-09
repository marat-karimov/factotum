import { BrowserWindow } from "electron";
import {
  sendAppendToLogs,
  sendInvalidInput,
  sendRenderEmptyState,
  sendRenderSpinner,
  sendRenderTable,
  sendUpdateDatabaseSchema,
  sendValidInput,
} from "./ipcDispatcher";
import { sendGetSchema, sendRunSql, sendValidate } from "./requestDispatcher";

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
    const message = `${sql} Executed successfully`;
    sendAppendToLogs(this.win, { message, kind: "success" });

    await this.updateDatabaseInfo();

    if (!tableData.tableData) {
      sendRenderEmptyState(this.win);
      this.updateExportFileMenuItemEnabledState(false);
      return;
    }

    sendRenderTable(this.win, tableData);
    this.updateExportFileMenuItemEnabledState(true);
  };

  private updateExportFileMenuItemEnabledState(value: boolean) {
    this.mainMenu.getMenuItemById("export-file").enabled = value;
  }

  public async updateDatabaseInfo() {
    const { schema } = await sendGetSchema();

    sendUpdateDatabaseSchema(this.win, schema);
  }
}
