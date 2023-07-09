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

type CommandMap = Record<string, (args: any) => void>;

const tableRenderer = new TableRenderer();
const editor = new SqlEditor();
const logsWindow = new LogsWindow();
const statusBar = new StatusBar();
const schemaTree = new SchemaTree();

const commandMap: CommandMap = {
  invalidInput: editor.handleInvalidInput,
  validInput: editor.handleValidInput,
  getSqlToRun: getSqlToRun,
  renderCurrentEngine: statusBar.renderCurrentEngine,
  renderMemoryUsage: statusBar.renderMemoryUsage,
  updateDatabaseSchema: updateDatabaseSchema,
  appendToLogs: logsWindow.appendToLogs,
  renderTable: tableRenderer.renderNewTable,
  renderLatestRenderedTable: tableRenderer.renderLatestTable,
  appendToEditor: editor.appendToEditor,
  renderSpinner: renderSpinner,
  renderEmptyState: renderEmptyState,
  renderSearchBox: tableRenderer.renderSearchBox,
  hideSearchBox: tableRenderer.hideSearchBox,
};

function initialize() {
  renderEmptyState();
  Object.keys(commandMap).forEach((command) => {
    window.api.receive(command, commandMap[command]);
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
