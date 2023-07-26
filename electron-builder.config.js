const pyExecDir = process.platform + "_python";
const productName = process.env.npm_package_productName;
const appId = process.env.npm_package_name;

const version = process.env.VERSION
  ? process.env.VERSION
  : process.env.npm_package_version;

const files = [".webpack/**/*", "package.json"];
const extraResources = [pyExecDir, "assets", "config.json"];

process.env['CSC_IDENTITY_AUTO_DISCOVERY'] = process.env.CI ? true : false

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

module.exports = {
  appId,
  productName,
  icon: "assets/icon.ico",
  electronLanguages: "en-US",
  buildVersion: version,
  win: {
    target: "msi",
    files,
    extraResources,
    artifactName: "${productName}.msi",
    forceCodeSigning: process.env.CI ? true : false,
  },
  msi: {
    oneClick: true,
    perMachine: false,
  },
  afterSign: "notarize.ts",
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"],
      },
    ],
    entitlement: 'entitlements.mac.inherit.plist',
    hardenedRuntime: true,
    artifactName: "${productName}-${arch}.dmg",
    files,
    extraResources,
    icon: "assets/icon.png"
  },
};
