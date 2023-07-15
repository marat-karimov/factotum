import "./static/codemirror.css";
import "./static/darcula.css";
import "./static/styles.css";
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
import { sendSqlToRun } from "./toMainSender";
import { DataBaseSchema, FromMainChannels } from "../types/types";
import { messages } from "../messages";

const tableRenderer = new TableRenderer();
const editor = new SqlEditor();
const logsWindow = new LogsWindow();
const statusBar = new StatusBar();
const schemaTree = new SchemaTree();

type CommandMap = Record<FromMainChannels, (args: any) => void>;

const commandMap: CommandMap = {
  [FromMainChannels.InvalidInput]: editor.handleInvalidInput,
  [FromMainChannels.ValidInput]: editor.handleValidInput,
  [FromMainChannels.GetSqlToRun]: getSqlToRun,
  [FromMainChannels.RenderCurrentEngine]: statusBar.renderCurrentEngine,
  [FromMainChannels.RenderMemoryUsage]: statusBar.renderMemoryUsage,
  [FromMainChannels.UpdateDatabaseSchema]: updateDatabaseSchema,
  [FromMainChannels.AppendToLogs]: logsWindow.appendToLogs,
  [FromMainChannels.RenderTable]: tableRenderer.renderNewTable,
  [FromMainChannels.RenderLastTable]: tableRenderer.renderLatestTable,
  [FromMainChannels.AppendToEditor]: editor.appendToEditor,
  [FromMainChannels.RenderSpinner]: renderSpinner,
  [FromMainChannels.RenderEmptyState]: renderEmptyState,
  [FromMainChannels.RenderSearchBox]: tableRenderer.renderSearchBox,
  [FromMainChannels.HideSearchBox]: tableRenderer.hideSearchBox,
};

function initialize() {
  renderEmptyState();
  Object.keys(commandMap).forEach((command) => {
    window.api.receive(
      command as FromMainChannels,
      commandMap[command as FromMainChannels]
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
