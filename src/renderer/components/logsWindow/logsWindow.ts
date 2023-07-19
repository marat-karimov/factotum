import { LogMessage } from "../../../types/types";

export class LogsWindow {
  private colorMap: { [key: string]: string } = {
    success: "#6A8759",
    error: "#B71C1C",
    info: "#a9b7c6",
  };

  private logElement = document.getElementById("logs-output");

  public appendToLogs = (data: LogMessage): void => {
    const { message, kind } = data;

    const existingValue = this.logElement.innerHTML;
    const color = this.colorMap[kind];
    const updatedValue = `<span style="color: ${color}"><li class='log-item'>${message}</li></span><br>${existingValue}`;

    this.logElement.innerHTML = updatedValue;
  };
}
