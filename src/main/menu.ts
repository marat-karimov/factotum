import {
  Menu,
  dialog,
  BrowserWindow,
  MenuItemConstructorOptions,
} from "electron";
import { allowedReadFormats, allowedWriteFormats } from "./loadConfig";

export class MainMenu {
  private mainWindow: BrowserWindow;
  private importFilesHandler: (filePath: string) => Promise<void>;
  private exportFileHandler: (filePath: string) => Promise<void>;
  private runSqlHandler: () => Promise<void>;
  private searchHandler: () => Promise<void>;
  private engineSwitchHandler: (
    selectedItemId: string,
    otherItemId: string
  ) => Promise<void>;

  constructor({
    mainWindow,
    importFilesHandler,
    exportFileHandler,
    runSqlHandler,
    searchHandler,
    engineSwitchHandler,
  }: {
    mainWindow: BrowserWindow;
    importFilesHandler: (filePath: string) => Promise<void>;
    exportFileHandler: (filePath: string) => Promise<void>;
    runSqlHandler: () => Promise<void>;
    searchHandler: () => Promise<void>;
    engineSwitchHandler: (
      selectedItemId: string,
      otherItemId: string
    ) => Promise<void>;
  }) {
    this.mainWindow = mainWindow;
    this.importFilesHandler = importFilesHandler;
    this.exportFileHandler = exportFileHandler;
    this.runSqlHandler = runSqlHandler;
    this.searchHandler = searchHandler;
    this.engineSwitchHandler = engineSwitchHandler;
  }

  async openFileDialog() {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: allowedReadFormats,
    });

    if (!result.canceled) {
      for (const filePath of result.filePaths) {
        await this.importFilesHandler(filePath);
      }
    }
  }

  async saveFileDialog() {
    const result = await dialog.showSaveDialog({
      filters: allowedWriteFormats,
    });

    if (!result.canceled) {
      const filePath = result.filePath;
      await this.exportFileHandler(filePath);
    }
  }

  buildMenu(): Electron.Menu {
    const importFilesItem: MenuItemConstructorOptions = {
      label: "Import files",
      id: "import-files",
      accelerator: "CmdOrCtrl+O",
      click: () => this.openFileDialog(),
    };

    const exportSqlItem: MenuItemConstructorOptions = {
      label: "Export latest SQL result",
      id: "export-file",
      enabled: false,
      accelerator: "CmdOrCtrl+S",
      click: () => this.saveFileDialog(),
    };

    const separatorItem: MenuItemConstructorOptions = {
      type: "separator",
    };

    const quitItem: MenuItemConstructorOptions = {
      role: "quit",
    };

    const fileMenu: MenuItemConstructorOptions = {
      label: "File",
      id: "file",
      submenu: [importFilesItem, exportSqlItem, separatorItem, quitItem],
    };

    const searchItem: MenuItemConstructorOptions = {
      id: "search",
      label: "Find in table",
      accelerator: "CmdOrCtrl+F",
      click: () => this.searchHandler(),
    };

    const editMenu: MenuItemConstructorOptions = {
      label: "Edit",
      submenu: [searchItem],
    };

    const polarsItem: MenuItemConstructorOptions = {
      id: "polars",
      type: "checkbox",
      label: "Polars",
      checked: true,
      enabled: false,
      click: () => this.engineSwitchHandler("polars", "duckdb"),
    };

    const duckdbItem: MenuItemConstructorOptions = {
      type: "checkbox",
      id: "duckdb",
      label: "DuckDB (experimental)",
      checked: false,
      enabled: true,
      click: () => this.engineSwitchHandler("duckdb", "polars"),
    };

    const engineMenu: MenuItemConstructorOptions = {
      label: "Engine",
      submenu: [polarsItem, duckdbItem],
    };

    const runSqlItem: MenuItemConstructorOptions = {
      label: "Run SQL",
      accelerator: "CmdOrCtrl+Enter",
      click: () => this.runSqlHandler(),
    };

    const runMenu: MenuItemConstructorOptions = {
      label: "Run",
      submenu: [runSqlItem],
    };

    const zoomIn: MenuItemConstructorOptions = {
      label: "Zoom In",
      accelerator: "CmdOrCtrl+=",
      click: () => {
        const currentZoom = this.mainWindow.webContents.getZoomFactor();
        this.mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
      },
    };

    const zoomOut: MenuItemConstructorOptions = {
      label: "Zoom Out",
      accelerator: "CmdOrCtrl+-",
      click: () => {
        const currentZoom = this.mainWindow.webContents.getZoomFactor();
        if (currentZoom - 0.1 > 0.1) {
          this.mainWindow.webContents.setZoomFactor(currentZoom - 0.1);
        }
      },
    };

    const zoomReset: MenuItemConstructorOptions = {
      label: "Zoom Reset",
      accelerator: "CmdOrCtrl+0",
      click: () => {
        this.mainWindow.webContents.setZoomFactor(1);
      },
    };

    const viewMenu: MenuItemConstructorOptions = {
      label: "View",
      submenu: [zoomIn, zoomOut, zoomReset],
    };

    const menuTemplate: MenuItemConstructorOptions[] = [
      fileMenu,
      editMenu,
      engineMenu,
      viewMenu,
      runMenu,
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);

    return menu;
  }
}
