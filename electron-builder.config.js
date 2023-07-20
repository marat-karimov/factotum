const pyExecDir = process.platform + "_python";
const productName = process.env.npm_package_productName;
const appId = process.env.npm_package_name;

const version = process.env.VERSION
  ? process.env.VERSION
  : process.env.npm_package_version;

const icon = "assets/icon.ico";

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

module.exports = {
  appId,
  productName,
  icon,
  electronLanguages: "en-US",
  buildVersion: version,
  win: {
    target: "msi",
    files: [".webpack/**/*", "package.json"],
    extraResources: [pyExecDir, "assets" ,"config.json"],
    artifactName: `${productName}.msi`,
    forceCodeSigning: process.env.CI ? true : false,
  },
  msi: {
    oneClick: true,
    perMachine: false,
  },
};
