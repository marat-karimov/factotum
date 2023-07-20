import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  nativeImage,
} from "electron";
import { TitlebarColor, CustomTitlebar } from "custom-electron-titlebar";

const iconPath =
  process.env.NODE_ENV === "development"
    ? "assets/icon.ico"
    : "resources/assets/icon.ico";

window.addEventListener("DOMContentLoaded", () => {
  const icon = nativeImage.createFromPath(iconPath);
  new CustomTitlebar({
    backgroundColor: TitlebarColor.fromHex("#282828"),
    menuBarBackgroundColor: TitlebarColor.fromHex("#282828"),
    containerOverflow: "hidden",
    menuPosition: "left",
    iconSize: 24,
    icon,
  });
});

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
