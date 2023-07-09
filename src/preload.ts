import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

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
