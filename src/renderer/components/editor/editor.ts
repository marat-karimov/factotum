import CodeMirror, {
  EditorFromTextArea,
  TextMarker,
  MarkerRange,
} from "codemirror";
import { sendSqlToValidate } from "../../toMainSender";
import {
  DataBaseSchema,
  EditorValuePosition,
  ErrorInput,
} from "../../../types/types";

export class SqlEditor {
  private sqlEditorElement = document.getElementById(
    "sql-editor"
  ) as HTMLTextAreaElement;
  private marks: TextMarker<MarkerRange>[] = [];
  private lastValidInput: string = null;
  private editor: EditorFromTextArea;

  constructor() {
    this.editor = this.initEditor();
    this.bindEditorEvents();
  }

  public appendToEditor = (value: string) => {
    const existingValue = this.editor.getValue();
    this.editor.setValue(existingValue + "\n" + value);
  };

  public updateEditorHint(schema: DataBaseSchema) {
    this.editor.setOption("hintOptions", {
      tables: schema,
    });
  }

  public handleInvalidInput = ({ sql, error }: ErrorInput): void => {
    const valuePosition: EditorValuePosition | null =
      this.getValuePosition(sql);

    if (!valuePosition) {
      return;
    }

    const { startPos, endPos } = valuePosition;

    const mark = this.editor.markText(startPos, endPos, {
      className: "highlight",
      title: error,
    });

    this.marks.push(mark);
    this.lastValidInput = null;
  };

  public handleValidInput = ({
    last_statement,
  }: {
    last_statement: string;
  }) => {
    this.marks.forEach((mark) => {
      mark.clear();
    });
    this.marks = [];
    this.lastValidInput = last_statement;
  };

  getEditorSelection() {
    let editorSelection = this.editor.getSelection();

    if (!editorSelection && this.lastValidInput) {
      this.selectLastValidInput();
      editorSelection = this.editor.getSelection();
    }

    return editorSelection;
  }

  private initEditor() {
    const editor = CodeMirror.fromTextArea(this.sqlEditorElement, {
      mode: "text/x-sql",
      theme: "darcula",
      lineNumbers: true,
      hintOptions: { tables: {} },
    });

    return editor;
  }

  private bindEditorEvents(): void {
    this.editor.on("inputRead", (editor, input) => {
      if (this.shouldTriggerAutocomplete(input)) {
        CodeMirror.commands.autocomplete(editor, null, {
          completeSingle: false,
        });
      }
    });

    this.editor.on(
      "mousedown",
      this.handleClickOutsideAutocomplete(this.editor)
    );
    this.editor.on("change", this.handleEditorChange(this.editor));
  }

  private handleClickOutsideAutocomplete(editor: EditorFromTextArea) {
    return function (_: EditorFromTextArea, event: MouseEvent): void {
      const completionActive = editor.state.completionActive;

      if (completionActive && completionActive.widget) {
        const widgetNode = completionActive.widget.hints;

        // Check if the clicked element is not part of the widget
        if (widgetNode && !widgetNode.contains(event.target as Node)) {
          completionActive.close();
        }
      }
    };
  }

  private handleEditorChange(editor: EditorFromTextArea) {
    return function (): void {
      sendSqlToValidate(editor.getValue());
    };
  }

  private getValuePosition(value: string) {
    const start = this.editor.getValue().lastIndexOf(value);
    const end = start + value.length;
    const startPos = this.editor.posFromIndex(start);
    const endPos = this.editor.posFromIndex(end);

    if (start === -1) {
      console.log("Substring not found");
      return;
    }

    return { startPos, endPos };
  }

  private selectLastValidInput = () => {
    const { startPos, endPos } = this.getValuePosition(this.lastValidInput);
    this.editor.setSelection(startPos, endPos);
  };

  private shouldTriggerAutocomplete(input: CodeMirror.EditorChange): boolean {
    return input.text[0] !== ";" && input.text[0] !== " ";
  }
}
