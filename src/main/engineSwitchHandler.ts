import { BrowserWindow, MessageBoxOptions, dialog } from "electron";
import { sendAppendToLogs, sendRenderCurrentEngine } from "./fromMainSender";
import { sendKill } from "./requestDispatcher";
import { Heartbeat } from "./heartbeat";
import { spawnPythonProcess } from "./spawnPython";
import { Engine } from "../types/types";
import { messages } from "../messages";

export class EngineSwitchHandler {
  private win: BrowserWindow;
  private currentEngine: Engine;
  private heartbeat: Heartbeat;
  private mainMenu: Electron.Menu;

  constructor(
    mainWindow: BrowserWindow,
    currentEngine: Engine,
    heartbeat: Heartbeat
  ) {
    this.currentEngine = currentEngine;
    this.win = mainWindow;
    this.heartbeat = heartbeat;
  }

  public handleEngineSwitch = async (
    selectedItemId: Engine,
    otherItemId: Engine
  ) => {
    const hasUserConfirmed = await this.showEngineSwitchDialog(selectedItemId);

    if (!hasUserConfirmed) {
      this.revertToPreviousState(selectedItemId, otherItemId);
      return;
    }

    this.switchEngine(selectedItemId, otherItemId);
  };

  public setMainMenu(mainMenu: Electron.Menu) {
    this.mainMenu = mainMenu;
  }

  private updateMenuItem(
    itemId: Engine,
    isChecked: boolean,
    isEnabled: boolean
  ): void {
    const item = this.mainMenu.getMenuItemById(itemId);
    item.checked = isChecked;
    item.enabled = isEnabled;
  }

  private revertToPreviousState(
    selectedItemId: Engine,
    otherItemId: Engine
  ): void {
    this.updateMenuItem(
      selectedItemId,
      selectedItemId === this.currentEngine,
      selectedItemId !== this.currentEngine
    );
    this.updateMenuItem(
      otherItemId,
      otherItemId === this.currentEngine,
      otherItemId !== this.currentEngine
    );
  }

  private switchEngine(selectedItemId: Engine, otherItemId: Engine): void {
    this.updateMenuItem(selectedItemId, true, false);
    this.updateMenuItem(otherItemId, false, true);
    this.currentEngine = selectedItemId;
    this.restartBackendWithEngine(selectedItemId);
  }

  private showEngineSwitchDialog = async (engine: Engine) => {
    const message = messages.engineSwitchConfirmation(
      this.currentEngine,
      engine
    );

    const options: MessageBoxOptions = {
      type: "warning",
      buttons: ["Cancel", "Proceed"],
      title: "Warning",
      message,
    };

    const { response } = await dialog.showMessageBox(this.win, options);

    return Boolean(response);
  };

  private async restartBackendWithEngine(engine: Engine) {
    this.heartbeat.stopHeartbeat();
    sendKill();
    await new Promise(resolve => setTimeout(resolve, 1100));
    this.spawnServerAndStartSendingHeartbeats(engine);
    this.reloadWindowAndSendEngineUpdate(engine);
    this.currentEngine = engine;
  }

  private spawnServerAndStartSendingHeartbeats(engine: Engine) {
    const server = spawnPythonProcess(engine);
    server.stdout.on("data", (data) => {
      if (data.toString().includes("Serving Flask app")) {
        this.heartbeat.startSendingHeartbeats();
      }
    });
  }

  private reloadWindowAndSendEngineUpdate = (engine: Engine) => {
    this.win.reload();
    this.win.webContents.once("did-finish-load", () => {
      this.mainMenu.getMenuItemById("export-file").enabled = false;
      sendAppendToLogs(this.win, {
        message: messages.engineSwitchSuccess(engine),
        kind: "success",
      });
      sendRenderCurrentEngine(this.win, engine);
    });
  };
}
