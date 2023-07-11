export {};

declare global {
  interface Window {
    api: IpcApi;
  }

  interface IpcApi {
    send: (channel: string, data?: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
  }
}
