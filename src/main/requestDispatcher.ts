import {
  DataBaseSchemaResponse,
  ExportFileResponse,
  HeartbeatResponse,
  ImportFileResponse,
  KillResponse,
  RunSqlResponse,
  ValidateResponse,
} from "../types/types";
import { sendPost } from "./request";

export function sendImportFile(filePath: string): Promise<ImportFileResponse> {
  return sendPost("import_file", { file_path: filePath });
}

export function sendWriteFile(filePath: string): Promise<ExportFileResponse> {
  return sendPost("export_file", { file_path: filePath });
}

export function sendRunSql(sql: string): Promise<RunSqlResponse> {
  return sendPost("run_sql", { sql: sql });
}

export function sendGetSchema(): Promise<DataBaseSchemaResponse> {
  return sendPost("get_schema", {});
}

export function sendKill(): Promise<KillResponse> {
  return sendPost("kill", {});
}

export function sendHeartbeat(): Promise<HeartbeatResponse> {
  return sendPost("heartbeat", { heartbeat: "ping" });
}

export function sendValidate(data: string): Promise<ValidateResponse> {
  return sendPost("validate", { data });
}
