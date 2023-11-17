import os from "os";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const baseUrl = "https://micromamba.snakepit.net/api/micromamba";
const version = "1.4.9";
const platformArch = `${os.platform()}-${os.arch()}`;
const inArchivePath =
  os.platform() === "win32" ? "Library/bin/micromamba.exe" : "bin/micromamba";
let url: string;

switch (platformArch) {
  case "darwin-x64":
    url = `${baseUrl}/osx-64/${version}`;
    break;
  case "darwin-arm64":
    url = `${baseUrl}/osx-arm64/${version}`;
    break;
  case "linux-x64":
    url = `${baseUrl}/linux-64/${version}`;
    break;
  case "linux-arm64":
    url = `${baseUrl}/linux-aarch64/${version}`;
    break;
  case "win32-x64":
    url = `${baseUrl}/win-64/${version}`;
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
execSync(`tar -xvj -f ./micromamba.tar.bz2 ${inArchivePath}`);
console.log("micromamba extracted successfully.");

if (os.platform() === "win32") {
  fs.mkdirSync("./bin");
  fs.renameSync(`./${inArchivePath}`, "./bin/micromamba.exe");
  fs.rmSync("./Library", { recursive: true });
}
