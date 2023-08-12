import { spawnPythonProcess } from "../../../src/main/spawnPython";
import request from "supertest";
import { waitForServerToStart, closeServer } from "../helpers/server";
import { ChildProcessWithoutNullStreams } from "child_process";
import { Engine, ImportFileResponse, RunSqlResponse } from "../../../src/types/types";
import { globSync } from "glob";
import path from "path";

const engines = ["polars", "duckdb"];
const testFiles = globSync("tests/assets/test.*");

const host = "http://127.0.0.1:49213";

const runSqlExpectedResponse = {
  tableData: [{ col1: "val1", col2: "val2" }],
  columns: ["col1", "col2"],
  error: null as null,
};

describe.each(engines)("Using engine: %s", (engine) => {
  let server: ChildProcessWithoutNullStreams;

  beforeEach(async () => {
    server = spawnPythonProcess(engine as Engine);
    await waitForServerToStart(server);
  });

  afterEach(async () => {
    await closeServer(server);
  });

  test.each(testFiles)("Import file: %s", async (file_path) => {
    const tableName = path.basename(file_path, path.extname(file_path));

    const importFileResponse: ImportFileResponse = await makeRequest(
      "/import_file",
      { file_path }
    );
    expect(importFileResponse.error).toBeNull();
    expect(importFileResponse.tableName).toBe(tableName);

    const runSqlResponse: RunSqlResponse = await makeRequest("/run_sql", {
      sql: `select * from ${tableName}`,
    });
    expect(runSqlResponse).toEqual(runSqlExpectedResponse);
  });
});

async function makeRequest(endpoint: string, payload: any) {
  const response = await request(host).post(endpoint).send(payload);
  return response.body;
}
