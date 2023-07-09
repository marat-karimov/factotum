import { BrowserWindow } from "electron";
import {
  sendAppendToLogs,
  sendRenderLastTable,
  sendRenderSpinner,
} from "./ipcDispatcher";
import { sendWriteFile } from "./requestDispatcher";

export class ExportFileHandler {
  private win: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.win = mainWindow;
  }

  public handleExportFile = async (filePath: string) => {
    sendRenderSpinner(this.win);
    sendAppendToLogs(this.win, {
      message: `Exporting latest SQL result to ${filePath}`,
      kind: "info",
    });

    const { error } = await sendWriteFile(filePath);

    if (error) {
      const message = `Failed to export ${filePath} ${error}`;

      sendAppendToLogs(this.win, { message, kind: "error" });

      sendRenderLastTable(this.win);

      return;
    }

    this.handleExportFileSuccess(filePath);
  };

  private handleExportFileSuccess(filePath: string) {
    const message = `Latest SQL result has been exported to ${filePath}`;
    sendAppendToLogs(this.win, { message, kind: "success" });
    sendRenderLastTable(this.win);
  }
}
