import os from 'os';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Determine the correct download URL based on the platform
let url: string;
switch (os.platform()) {
  case 'darwin':
    url = 'https://micromamba.snakepit.net/api/micromamba/osx-64/latest';
    break;
  case 'linux':
    url = 'https://micromamba.snakepit.net/api/micromamba/linux-64/latest';
    break;
  default:
    throw new Error(`Unsupported platform: ${os.platform()}`);
}

const INSTALL_DIR = path.join(__dirname, 'micromamba');
const BIN_DIR = path.join(INSTALL_DIR, 'bin');

if (!fs.existsSync(INSTALL_DIR)) {
  fs.mkdirSync(INSTALL_DIR, { recursive: true });
}

if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}

const micromambaPath = path.join(BIN_DIR, 'micromamba');
const tarballPath = path.join(INSTALL_DIR, 'micromamba.tar.bz2');

if (!fs.existsSync(micromambaPath)) {
  // Download micromamba
  try {
    console.log('Downloading micromamba...');
    execSync(`curl -Ls ${url} -o ${tarballPath}`);
    console.log('micromamba downloaded successfully.');

    // Extract the tarball using the tar command
    console.log('Extracting micromamba...');
    execSync(`tar -xvj -C ${BIN_DIR} -f ${tarballPath} --strip-components=1 bin/micromamba`);
    console.log('micromamba extracted successfully.');
  } catch (error) {
    console.error(`Error downloading and extracting micromamba: ${error}`);
  }
} else {
  console.log('micromamba is already installed.');
}
