import "./static/styles.css";
import "./static/codemirror.css";
import "./static/darcula.css";
import "./static/treejs.css";
import "./static/tabulator.css";
import "./static/spinner.css";
import "./static/show-hint.css";

import "codemirror/mode/sql/sql";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";

import { SqlEditor } from "./components/editor/editor";

import { SchemaTree } from "./components/schemaTree/schemaTree";
import { TableRenderer } from "./components/table/tableRenderer";

import { renderSpinner } from "./components/spinner/spinner";
import { LogsWindow } from "./components/logsWindow/logsWindow";
import { renderEmptyState } from "./components/table/tableEmptyState";
import { StatusBar } from "./components/statusBar/statusBar";
import { sendSqlToRun } from "./ipcToMainSender";
import { DataBaseSchema, IpcChannels } from "../types/types";

const tableRenderer = new TableRenderer();
const editor = new SqlEditor();
const logsWindow = new LogsWindow();
const statusBar = new StatusBar();
const schemaTree = new SchemaTree();

type CommandMap = Record<IpcChannels, (args: any) => void>;

const commandMap: CommandMap = {
  [IpcChannels.InvalidInput]: editor.handleInvalidInput,
  [IpcChannels.ValidInput]: editor.handleValidInput,
  [IpcChannels.GetSqlToRun]: getSqlToRun,
  [IpcChannels.RenderCurrentEngine]: statusBar.renderCurrentEngine,
  [IpcChannels.RenderMemoryUsage]: statusBar.renderMemoryUsage,
  [IpcChannels.UpdateDatabaseSchema]: updateDatabaseSchema,
  [IpcChannels.AppendToLogs]: logsWindow.appendToLogs,
  [IpcChannels.RenderTable]: tableRenderer.renderNewTable,
  [IpcChannels.RenderLastTable]: tableRenderer.renderLatestTable,
  [IpcChannels.AppendToEditor]: editor.appendToEditor,
  [IpcChannels.RenderSpinner]: renderSpinner,
  [IpcChannels.RenderEmptyState]: renderEmptyState,
  [IpcChannels.RenderSearchBox]: tableRenderer.renderSearchBox,
  [IpcChannels.HideSearchBox]: tableRenderer.hideSearchBox,
};

function initialize() {
  renderEmptyState();
  Object.keys(commandMap).forEach((command) => {
    window.api.receive(
      command as IpcChannels,
      commandMap[command as IpcChannels]
    );
  });
}

function updateDatabaseSchema(schema: DataBaseSchema) {
  schemaTree.renderSchema(schema);
  editor.updateEditorHint(schema);
}

function getSqlToRun() {
  const editorSelection = editor.getEditorSelection();

  if (!editorSelection) {
    logsWindow.appendToLogs({
      message: "Please select one SQL statement",
      kind: "error",
    });
    return;
  }

  sendSqlToRun(editorSelection);
}

initialize();
