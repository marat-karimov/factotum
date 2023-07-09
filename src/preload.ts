import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Define the types for the exposed API object
interface ExposedAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
}

// Access the exposed API methods through a wrapper object
const api: ExposedAPI = {
  send: (channel: string, data: any) => {
    // Send message to the main process
    ipcRenderer.send(channel, data);
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    // Listen for messages from the main process
    ipcRenderer.on(channel, (event: IpcRendererEvent, ...args: any[]) => func(...args));
  },
  invoke: <T>(channel: string, ...args: any[]) => {
    // Return a promise that resolves with the value returned by the main process
    return new Promise<T>((resolve, reject) => {
      ipcRenderer.invoke(channel, ...args)
        .then((result: T) => resolve(result))
        .catch((error: Error) => reject(error));
    });
  }
};

// Expose the API wrapper object to the renderer process
contextBridge.exposeInMainWorld("api", api);
