import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { join } from "path";
import { Engine } from "../types/types";

export function spawnPythonProcess(
  engine: Engine
): ChildProcessWithoutNullStreams {
  const path = resolvePyExecPath();
  return spawn(path, [engine]);
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
