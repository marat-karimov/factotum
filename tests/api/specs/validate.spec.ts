import { spawnPythonProcess } from "../../../src/main/spawnPython";
import { waitForServerToStart, closeServer } from "../helpers/server";
import { ChildProcessWithoutNullStreams } from "child_process";
import { Engine, ValidateResponse } from "../../../src/types/types";
import { makeRequest } from "../helpers/request";

const engines = ["polars", "duckdb"];

describe.each(engines)("Engine: %s", (engine) => {
  let server: ChildProcessWithoutNullStreams;

  beforeAll(async () => {
    server = spawnPythonProcess(engine as Engine);
    await waitForServerToStart(server);
    await makeRequest("/import_file", { file_path: "tests/assets/test.csv" });
  });

  afterAll(async () => {
    await closeServer(server);
  });

  test("SQL Validation - Wrong SQL", async () => {
    // Make request
    const data = "--comment\n select * from test2; select * from test1";
    const response: ValidateResponse = await makeRequest("/validate", { data });

    // Check response
    expect(response.result).toEqual(false);
    expect(response.last_statement).toEqual("select * from test1");
    expect(response.sql).toEqual("select * from test2;select * from test1");
    expect(response.error).toBeTruthy();
  });

  test("SQL Validation - Correct SQL", async () => {
    // Make request
    const data = "--comment\n select * from test2; select * from test";
    const response: ValidateResponse = await makeRequest("/validate", { data });

    // Check response
    expect(response.result).toEqual(true);
    expect(response.last_statement).toEqual("select * from test");
    expect(response.sql).toEqual("select * from test2;select * from test");
    expect(response.error).toBeFalsy();
  });
});
