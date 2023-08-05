import os from "os";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const baseUrl = "https://micromamba.snakepit.net/api/micromamba";
const platformArch = `${os.platform()}-${os.arch()}`;
const inArchivePath =
  os.platform() === "win32" ? "Library/bin/micromamba.exe" : "bin/micromamba";
let url: string;

switch (platformArch) {
  case "darwin-x64":
    url = `${baseUrl}/osx-64/latest`;
    break;
  case "darwin-arm64":
    url = `${baseUrl}/osx-arm64/latest`;
    break;
  case "linux-x64":
    url = `${baseUrl}/linux-64/latest`;
    break;
  case "linux-arm64":
    url = `${baseUrl}/linux-aarch64/latest`;
    break;
  case "win32-x64":
    url = `${baseUrl}/win-64/latest`;
    break;
  default:
    throw new Error(`Unsupported platform: ${platformArch}`);
}

const installDir = path.join(__dirname, "micromamba");
const tarballPath = path.join(installDir, "micromamba.tar.bz2");

if (!fs.existsSync(installDir)) {
  fs.mkdirSync(installDir, { recursive: true });
}

console.log("Downloading micromamba...");
execSync(`curl -Ls ${url} -o ${tarballPath}`);
console.log("micromamba downloaded successfully.");

console.log("Extracting micromamba...");
process.chdir(installDir);
execSync(
  `tar -xvj --force-local -f ./micromamba.tar.bz2 ${inArchivePath}`
);
console.log("micromamba extracted successfully.");
