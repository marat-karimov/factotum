import { BrowserWindow } from "electron";
import {
  sendAppendToLogs,
  sendRenderLastTable,
  sendRenderSpinner,
} from "./fromMainSender";
import { sendWriteFile } from "./requestDispatcher";
import { messages } from "../messages";

export class ExportFileHandler {
  private win: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.win = mainWindow;
  }

  public handleExportFile = async (filePath: string) => {
    sendRenderSpinner(this.win);
    sendAppendToLogs(this.win, {
      message: messages.exportingStart(filePath),
      kind: "info",
    });

    const { error } = await sendWriteFile(filePath);

    if (error) {
      const message = messages.exportingFail(filePath, error);

      sendAppendToLogs(this.win, { message, kind: "error" });

      sendRenderLastTable(this.win);

      return;
    }

    this.handleExportFileSuccess(filePath);
  };

  private handleExportFileSuccess(filePath: string) {
    const message = messages.exportingSuccess(filePath);
    sendAppendToLogs(this.win, { message, kind: "success" });
    sendRenderLastTable(this.win);
  }
}
