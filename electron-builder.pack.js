const pyExecDir = process.platform + "_python";

const files = [".webpack/**/*", "package.json"];
const extraResources = [pyExecDir, "assets", "config.json"];

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

module.exports = {
  icon: "assets/icon.ico",
  electronLanguages: "en-US",
  win: {
    target: "dir",
    files,
    extraResources,
    forceCodeSigning: false,
  },
  mac: {
    identity: null,
    notarize: false,
    target: 'dir',
    files,
    extraResources,
    icon: "assets/icon.png",
  },
};
