import { spawnPythonProcess } from "../../../src/main/spawnPython";
import { waitForServerToStart, closeServer } from "../helpers/server";
import { ChildProcessWithoutNullStreams } from "child_process";
import { DataBaseSchemaResponse, Engine } from "../../../src/types/types";
import { makeRequest } from "../helpers/request";

const engines = ["polars", "duckdb"];

const expectedResponse = {
  schema: { test: ["col1", "col2"] },
  error: null as null,
};

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

  test("Get schema", async () => {
    const response: DataBaseSchemaResponse = await makeRequest(
      "/get_schema",
      {}
    );
    expect(response).toStrictEqual(expectedResponse);
  });
});
