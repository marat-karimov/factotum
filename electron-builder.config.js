const pyExecDir = process.platform + "_python";
const productName = process.env.npm_package_productName;
const appId = process.env.npm_package_name;

const files = [".webpack/**/*", "package.json"];
const extraResources = [pyExecDir, "assets", "config.json"];

process.env["CSC_IDENTITY_AUTO_DISCOVERY"] = process.env.CI ? true : false;

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

module.exports = {
  appId,
  productName,
  electronLanguages: "en-US",
  win: {
    target: "msi",
    files,
    extraResources,
    artifactName: "${productName}.msi",
    forceCodeSigning: process.env.CI ? true : false,
   icon: "assets/icon.ico"
  },
  msi: {
    oneClick: true,
    perMachine: false,
  },
  mac: {
    notarize: { teamId: process.env.APPLE_TEAM_ID },
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"],
      },
    ],
    entitlements: "entitlements.mac.inherit.plist",
    hardenedRuntime: true,
    artifactName: "${productName}-${arch}.dmg",
    files,
    extraResources,
    icon: "assets/icon.icns",
  },
  linux: {
    target: ['deb', 'rpm'],
    files,
    extraResources,
    category: 'Science',
    icon: "assets/icon.icns",
    artifactName: "${productName}-${arch}.${ext}",
  }
};
