export {};

declare global {
  type Engine = "polars" | "duckdb";
  type Kind = "success" | "error" | "info";
  type TableData = Record<string, unknown>[];
  type DataBaseSchema = Record<string, string[]>;

  interface Window {
    api: IpcApi;
  }

  interface EditorValuePosition {
    startPos: CodeMirror.Position;
    endPos: CodeMirror.Position;
  }

  interface LogMessage {
    message: string;
    kind: Kind;
  }

  interface ValidInput {
    sql: string;
    last_statement: string;
  }

  interface InvalidInput {
    sql: string;
    error: string;
  }

  interface ErrorInput {
    sql: string;
    error: string;
  }

  interface ImportFileResponse {
    tableName: string;
    error: string;
  }

  interface ExportFileResponse {
    error: string;
  }

  interface RunSqlResponse {
    tableData: TableData;
    columns: string[];
    error: string;
  }

  interface TableForRender {
    tableData: TableData;
    columns: string[];
  }

  interface DataBaseSchemaResponse {
    schema: DataBaseSchema;
  }

  interface HeartbeatResponse {
    heartbeat: string;
    memory_usage_mb: number;
  }

  interface KillResponse {
    message: string;
  }

  interface ValidateResponse {
    result: boolean;
    sql: string;
    last_statement: string;
    error: string;
  }

  interface IpcApi {
    send: (channel: string, data?: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    invoke: <T>(channel: string, ...args: any[]) => Promise<T>;
  }
}
