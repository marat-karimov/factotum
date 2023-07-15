import { BrowserWindow } from "electron";
import { sendRenderMemoryUsage } from "./fromMainSender";
import { sendHeartbeat } from "./requestDispatcher";

export class Heartbeat {
  private heartbeatIntervalId: NodeJS.Timeout | null;
  private win: BrowserWindow;
  private app: Electron.App;

  private heartbeatInterval = 3000;

  constructor(mainWindow: BrowserWindow, app: Electron.App) {
    this.win = mainWindow;
    this.app = app;
  }

  public startSendingHeartbeats = () => {
    const sendHeartbeatAndMemoryUsage = async () => {
      const { memory_usage_mb: pythonRamUsage } = await sendHeartbeat();
      const nodeRamUsage = this.calcNodeRamUsage();
      const totalRamUsage = Math.round(pythonRamUsage + nodeRamUsage);
      sendRenderMemoryUsage(this.win, String(totalRamUsage));
    };

    this.heartbeatIntervalId = setInterval(
      sendHeartbeatAndMemoryUsage,
      this.heartbeatInterval
    );
  };

  public stopHeartbeat() {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private calcNodeRamUsage() {
    const metrics = this.app.getAppMetrics();
    let totalMemory = 0;
    metrics.forEach((metric) => {
      totalMemory += metric.memory.privateBytes;
    });
    totalMemory = totalMemory / 1024;
    return totalMemory;
  }
}
