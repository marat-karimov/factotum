import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { join } from "path";
import { Engine } from "../types/types";

export function spawnPythonProcess(
  engine: Engine
): ChildProcessWithoutNullStreams {
  const path = resolvePyExecPath();
  const childProcess = spawn(path, [engine]);

  childProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  childProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  childProcess.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  childProcess.on("error", (err) => {
    console.error("Failed to spawn child process", err);
    process.exit(0);
  });

  return childProcess;
}

function resolvePyExecPath() {
  const platform = process.platform;
  const pyExecName = platform === "win32" ? "Factotum.exe" : "Factotum";
  const pyExecDir = platform + "_python";
  const pyExecPath =
    process.env.NODE_ENV === "development"
      ? join(__dirname, `../../${pyExecDir}`, pyExecName)
      : join(process.resourcesPath, pyExecDir, pyExecName);

  return pyExecPath;
}
