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
const icon = "assets/icon.ico";

const name = process.env.npm_package_productName

const version = process.env.VERSION
  ? process.env.VERSION
  : process.env.npm_package_version;

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon,
    extraResource: [pyExecDir, "config.json"],
    appVersion: version,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      loadingGif: "assets/transparent.gif",
      setupIcon: icon,
      setupExe: `${name}.exe`,
      version,
      name
    }),
    new MakerWix({
      icon,
      language: 1033,
      shortcutFolderName: name,
      features: { autoLaunch: true, autoUpdate: false },
      version,
      name
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
