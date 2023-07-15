export type Engine = "polars" | "duckdb";
export type Kind = "success" | "error" | "info";
export type TableData = Record<string, unknown>[];
export type DataBaseSchema = Record<string, string[]>;

export interface EditorValuePosition {
  startPos: CodeMirror.Position;
  endPos: CodeMirror.Position;
}

export interface LogMessage {
  message: string;
  kind: Kind;
}

export interface ValidInput {
  sql: string;
  last_statement: string;
}

export interface InvalidInput {
  sql: string;
  error: string;
}

export interface ErrorInput {
  sql: string;
  error: string;
}

export interface ImportFileResponse {
  tableName: string;
  error: string;
}

export interface ExportFileResponse {
  error: string;
}

export interface RunSqlResponse {
  tableData: TableData;
  columns: string[];
  error: string;
}

export interface TableForRender {
  tableData: TableData;
  columns: string[];
}

export interface DataBaseSchemaResponse {
  schema: DataBaseSchema;
}

export interface HeartbeatResponse {
  heartbeat: string;
  memory_usage_mb: number;
}

export interface KillResponse {
  message: string;
}

export interface ValidateResponse {
  result: boolean;
  sql: string;
  last_statement: string;
  error: string;
}

export enum FromMainChannels {
  AppendToLogs = "appendToLogs",
  RenderCurrentEngine = "renderCurrentEngine",
  AppendToEditor = "appendToEditor",
  RenderMemoryUsage = "renderMemoryUsage",
  RenderSearchBox = "renderSearchBox",
  HideSearchBox = "hideSearchBox",
  RenderTable = "renderTable",
  RenderEmptyState = "renderEmptyState",
  UpdateDatabaseSchema = "updateDatabaseSchema",
  GetSqlToRun = "getSqlToRun",
  ValidInput = "validInput",
  InvalidInput = "invalidInput",
  RenderSpinner = "renderSpinner",
  RenderLastTable = "renderLatestRenderedTable",
}

export enum ToMainChannels {
  SqlToRun = "sqlToRun",
  SqlToValidate = "sqlToValidate",
  CopyToClipboard = "copyToClipboard",
  SearchBoxHidden = "searchBoxHidden",
}

export interface FromMainDataTypes {
  [FromMainChannels.AppendToLogs]: LogMessage;
  [FromMainChannels.RenderCurrentEngine]: Engine;
  [FromMainChannels.AppendToEditor]: string;
  [FromMainChannels.RenderMemoryUsage]: string;
  [FromMainChannels.RenderTable]: TableForRender;
  [FromMainChannels.UpdateDatabaseSchema]: DataBaseSchema;
  [FromMainChannels.ValidInput]: ValidInput;
  [FromMainChannels.InvalidInput]: InvalidInput;
}

export interface ToMainDataTypes {
  [ToMainChannels.SqlToRun]: string;
  [ToMainChannels.SqlToValidate]: string;
  [ToMainChannels.CopyToClipboard]: string;
}
