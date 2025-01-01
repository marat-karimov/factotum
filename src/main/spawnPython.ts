import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { join } from "path";
import { Engine } from "../types/types";

export function spawnPythonProcess(
  engine: Engine
): ChildProcessWithoutNullStreams {
  const path = resolvePyExecPath();

  const server = spawn(path, [engine]);

  server.stderr.on("data", (data) => {
    console.error(`Server stderr: ${data}`);
  });

  server.on("close", (code) => {
    if (!(code === null || code === 0)) {
      console.log(`Server exited with code ${code}`);
      process.exit(0);
    }
  });

  server.on("error", (err) => {
    console.error("Server failed", err);
    process.exit(0);
  });
  return server;
}

function resolvePyExecPath() {
  const platform = process.platform;
  const pyExecName = platform === "win32" ? "Factotum.exe" : "Factotum";
  const pyExecDir = platform + "_python";
  const pyExecPath =
    process.env.NODE_ENV === "test"
      ? join(__dirname, `../../${pyExecDir}`, pyExecName)
      : join(process.resourcesPath, pyExecDir, pyExecName);

  return pyExecPath;
}
