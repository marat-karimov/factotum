import { notarize } from "@electron/notarize";
import { AfterPackContext } from "electron-builder";

const _default = async function notarizing(context: AfterPackContext) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID as string,
    appleIdPassword: process.env.APPLE_ID_PASSWORD as string,
    teamId: process.env.APPLE_TEAM_ID as string,
    tool: "notarytool",
  });
};
export { _default as default };
