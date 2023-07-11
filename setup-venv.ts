import { execSync } from "child_process";

// Define commands based on the OS
const commands = {
  win32: {
    createVenv: "python -m venv venv",
    pythonPath: "venv\\Scripts\\python",
    pipPath: "venv\\Scripts\\pip",
  },
  unix: {
    createVenv: "python3 -m venv venv",
    pythonPath: "venv/bin/python",
    pipPath: "venv/bin/pip",
  },
};

// Select commands
const commandSet =
  process.platform === "win32" ? commands.win32 : commands.unix;

try {
  // Create virtual environment
  let stdout = execSync(commandSet.createVenv, { stdio: "pipe" }).toString();
  console.log(`Virtual environment created.\n${stdout}`);

  // Install packages from requirements.txt
  stdout = execSync(`${commandSet.pipPath} install -r requirements.txt`, {
    stdio: "pipe",
  }).toString();
  console.log(`Packages installed.\n${stdout}`);

  // Build python bin
  stdout = execSync(`${commandSet.pythonPath} setup.py build`, {
    stdio: "pipe",
  }).toString();
  console.log(`Python build is done.\n${stdout}`);
} catch (error) {
  console.log(`Error: ${error.message}`);
}
