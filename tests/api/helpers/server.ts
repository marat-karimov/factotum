import { ChildProcessWithoutNullStreams } from "child_process";

export function waitForServerToStart(
  server: ChildProcessWithoutNullStreams
): Promise<void> {
  return new Promise((resolve, reject) => {
    server.stdout.on("data", (data) => {
      if (data.toString().includes("Starting Factotum server")) {
        resolve();
      }
    });
    server.on("error", (error) => {
      reject(error);
    });
  });
}

export function closeServer(
  server: ChildProcessWithoutNullStreams
): Promise<void> {
  return new Promise((resolve) => {
    server.on("close", (code) => {
      if (code === null || code === 0) {
        resolve();
      }
    });

    server.kill();
  });
}
