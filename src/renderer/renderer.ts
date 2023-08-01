import "./static/codemirror.css";
import "./static/darcula.css";
import "./static/styles.css";
import "./static/tabulator.css";
import "./static/spinner.css";
import "./static/show-hint.css";

import "codemirror/mode/sql/sql";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";

import { SqlEditor } from "./components/editor/editor";

import { SchemaTreeRenderer } from "./components/schemaTree/schemaTree";
import { TableRenderer } from "./components/table/tableRenderer";

import { renderSpinner } from "./components/spinner/spinner";
import { LogsWindow } from "./components/logsWindow/logsWindow";
import { renderEmptyState } from "./components/table/tableEmptyState";
import { StatusBar } from "./components/statusBar/statusBar";
import { sendSqlToRun } from "./toMainSender";
import { DataBaseSchema, FromMainToRenderer } from "../types/types";
import { messages } from "../messages";

const tableRenderer = new TableRenderer();
const editor = new SqlEditor();
const logsWindow = new LogsWindow();
const statusBar = new StatusBar();
const schemaTree = new SchemaTreeRenderer();

type CommandMap = Record<FromMainToRenderer, (args: any) => void>;

const commandMap: CommandMap = {
  [FromMainToRenderer.InvalidInput]: editor.handleInvalidInput,
  [FromMainToRenderer.ValidInput]: editor.handleValidInput,
  [FromMainToRenderer.GetSqlToRun]: getSqlToRun,
  [FromMainToRenderer.RenderCurrentEngine]: statusBar.renderCurrentEngine,
  [FromMainToRenderer.RenderMemoryUsage]: statusBar.renderMemoryUsage,
  [FromMainToRenderer.UpdateDatabaseSchema]: updateDatabaseSchema,
  [FromMainToRenderer.AppendToLogs]: logsWindow.appendToLogs,
  [FromMainToRenderer.RenderTable]: tableRenderer.renderNewTable,
  [FromMainToRenderer.RenderLastTable]: tableRenderer.renderLatestTable,
  [FromMainToRenderer.AppendToEditor]: editor.appendToEditor,
  [FromMainToRenderer.RenderSpinner]: renderSpinner,
  [FromMainToRenderer.RenderEmptyState]: renderEmptyState,
  [FromMainToRenderer.RenderSearchBox]: tableRenderer.renderSearchBox,
  [FromMainToRenderer.HideSearchBox]: tableRenderer.hideSearchBox,
};

function initialize() {
  renderEmptyState();
  Object.keys(commandMap).forEach((command) => {
    window.api.receive(
      command as FromMainToRenderer,
      commandMap[command as FromMainToRenderer]
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
      message: messages.noSqlSelected,
      kind: "error",
    });
    return;
  }

  sendSqlToRun(editorSelection);
}

initialize();
