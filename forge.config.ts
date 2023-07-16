import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerWix } from "@electron-forge/maker-wix";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

const pyExecDir = process.platform + "_python";

const name = "Factotum";
const description = "SQL powered tabular data editor";
const manufacturer = "Marat Karimov";

const icon = "assets/icon.ico";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon,
    extraResource: [pyExecDir, "config.json"],
    appVersion: process.env.VERSION,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name,
      description,
      loadingGif: "assets/transparent.gif",
      setupIcon: icon,
      version: process.env.VERSION,
    }),
    new MakerWix({
      name,
      description,
      icon,
      manufacturer,
      version: process.env.VERSION,
      language: 1033,
      shortcutFolderName: name,
      features: { autoLaunch: true, autoUpdate: false },
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/renderer/index.html",
            js: "./src/renderer/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
  ],
};

export default config;
