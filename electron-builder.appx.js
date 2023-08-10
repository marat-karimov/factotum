const pyExecDir = process.platform + "_python";
const productName = process.env.npm_package_productName;
const appId = process.env.npm_package_name;
const author = process.env.npm_package_author_name;

const files = [".webpack/**/*", "package.json"];
const extraResources = [pyExecDir, "assets", "config.json"];

// This is to prevent appx code signing
delete process.env.CSC_LINK;
delete process.env.CSC_KEY_PASSWORD;

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

module.exports = {
  appId,
  productName,
  electronLanguages: "en-US",
  win: {
    target: "appx",
    files,
    extraResources,
    artifactName: "${productName}.${ext}",
    icon: "assets/icon.ico",
  },
  appx: {
    applicationId: process.env.APPX_APPLICATION_ID,
    identityName: process.env.APPX_IDENTITY_NAME,
    publisher: process.env.APPX_PUBLISHER,
    publisherDisplayName: author,
  },
};
