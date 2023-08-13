import { spawnPythonProcess } from "../../../src/main/spawnPython";
import { waitForServerToStart, closeServer } from "../helpers/server";
import { ChildProcessWithoutNullStreams } from "child_process";
import { Engine, ExportFileResponse } from "../../../src/types/types";
import path from "path";
import { allowedWriteFormats } from "../../../src/main/loadConfig";
import { makeRequest } from "../helpers/request";

const engines = ["polars", "duckdb"];

const extensions = allowedWriteFormats
  .map((item: { extensions: any }) => item.extensions)
  .flat() as string[];

const outputDir = path.join(__dirname, "../../../test-output");

describe.each(engines)(
  "Engine: %s",
  (engine) => {
    let server: ChildProcessWithoutNullStreams;

    beforeAll(async () => {
      server = spawnPythonProcess(engine as Engine);
      await waitForServerToStart(server);
      await makeRequest("/import_file", { file_path: "tests/assets/test.csv" });
      await makeRequest("/run_sql", { sql: `select * from test` });
    }, 10000);

    afterAll(async () => {
      await closeServer(server);
    });

    test.each(extensions)("Export to: %s", async (extension) => {
      const response: ExportFileResponse = await makeRequest("/export_file", {
        file_path: `${outputDir}/test.${extension}`,
      });
      expect(response.error).toBeNull();
    });
  },
  10000
);
