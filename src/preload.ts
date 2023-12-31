import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  nativeImage,
} from "electron";
import { TitlebarColor, CustomTitlebar } from "custom-electron-titlebar";
import { FromMainToPreloader } from "./types/types";

const api: IpcApi = {
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: any[]) =>
      func(...args)
    );
  },
  invoke: async <T>(channel: string, ...args: any[]): Promise<T> => {
    return await ipcRenderer.invoke(channel, ...args);
  },
};

contextBridge.exposeInMainWorld("api", api);

const iconPath =
  process.env.NODE_ENV === "development"
    ? "assets/icon.ico"
    : "resources/assets/icon.ico";

let titlebar: CustomTitlebar = null;

window.addEventListener("DOMContentLoaded", () => {
  const icon = nativeImage.createFromPath(iconPath);
  titlebar = new CustomTitlebar({
    backgroundColor: TitlebarColor.fromHex("#282828"),
    menuBarBackgroundColor: TitlebarColor.fromHex("#282828"),
    containerOverflow: "hidden",
    menuPosition: "left",
    iconSize: 24,
    icon,
  });
  adjustTitleBarForLinux();
});

ipcRenderer.on(FromMainToPreloader.RefreshMenu, () => {
  titlebar.refreshMenu();
});

function adjustTitleBarForLinux() {
  if (process.platform === "linux") {
    const controls = document.querySelector(
      ".cet-window-controls"
    ) as HTMLElement;
    const title = document.querySelector(".cet-title") as HTMLElement;
    const cetIcon = document.querySelector(".cet-icon") as HTMLElement;

    controls.style.display = "none";
    title.style.display = "none";
    cetIcon.style.display = "none";
  }
}
