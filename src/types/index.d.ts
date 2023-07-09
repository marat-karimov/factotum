export {};

declare global {
  interface Window {
    api: any;
  }

  interface ImportFileResponse {
    tableName: string;
    error: string;
  }

  interface ExportFileResponse {
    error: string;
  }

  type TableData = Record<string, unknown>[];

  interface RunSqlResponse {
    tableData: TableData;
    columns: string[];
    error: string;
  }

  interface TableForRender {
    tableData: TableData;
    columns: string[];
  }

  type DataBaseSchema = Record<string, string[]>;

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

  type Engine = "polars" | "duckdb";

  type Kind = "success" | "error" | "info";

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

  interface EditorValuePosition {
    startPos: CodeMirror.Position;
    endPos: CodeMirror.Position;
  }

  interface ErrorInput {
    sql: string;
    error: string;
  }

  interface ValidateResponse {
    result: boolean;
    sql: string;
    last_statement: string;
    error: string;
  }
}
