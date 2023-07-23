import { TableForRender } from "../../../types/types";
import { ctrlCHandler } from "../../shortcutsHandlers";
import { CellComponent, RowComponent } from "tabulator-tables";

const TABULATOR_CELL_SELECTED_CLASS = "tabulator-cell-selected";
const TABULATOR_ROW_SELECTED_CLASS = "tabulator-row-selected";
const TABULATOR_ROWNUM_SELECTED_CLASS = "tabulator-rownum-selected";

export class TableClickHandler {
  private selectedCell: CellComponent | null = null;
  private nativeSelectedRows: RowComponent[] = [];
  private blueSelectedRows: RowComponent[] = [];
  private isCtrlPressed = false;
  private columns: TableForRender["columns"] = [];

  constructor(columns: TableForRender["columns"]) {
    this.columns = columns;
    document.body.onkeydown = (event) => this.keydownHandler(event);
    document.body.onkeyup = (event) => this.keyupHandler(event);
  }

  destroy() {
    document.body.onkeydown = null;
    document.body.onkeyup = null;
    this.selectedCell = null;
    this.nativeSelectedRows = null;
    this.blueSelectedRows = null;
    this.columns = null;
  }

  public handleCellClick = (_: UIEvent, cell: CellComponent) => {
    this.removeCellBlueSelection(this.selectedCell);
    this.removeRowsBlueSelection();
    this.removeRowsNativeSelection();

    const row = cell.getRow();
    if (!row.isSelected()) {
      row.select();
      this.nativeSelectedRows.push(row);
    }

    cell.getElement().classList.add(TABULATOR_CELL_SELECTED_CLASS);
    this.selectedCell = cell;

    ctrlCHandler(cell.getValue());
  };

  public handleRowNumberClick = (_: UIEvent, cell: CellComponent) => {
    this.removeCellBlueSelection(this.selectedCell);
    this.removeRowsNativeSelection();

    if (!this.isCtrlPressed) {
      this.removeRowsBlueSelection();
    }

    const row = cell.getRow();
    const rowNumCellElement = row.getCell("row number").getElement();
    this.addClassName(row.getElement(), TABULATOR_ROW_SELECTED_CLASS);
    this.addClassName(rowNumCellElement, TABULATOR_ROWNUM_SELECTED_CLASS);

    this.blueSelectedRows.push(row);

    this.sendSelectedRowsToClipBoard();
  };

  private sendSelectedRowsToClipBoard() {
    const selectedRowsData = this.getOrderedSelectedRowsData();
    const csv = this.convertToCSV(selectedRowsData);
    ctrlCHandler(csv);
  }

  private getOrderedSelectedRowsData() {
    return this.blueSelectedRows.map((row) => {
      const rowData = row.getData();
      const orderedData: Array<{ [key: string]: any }> = [];
      this.columns.forEach((column) => {
        orderedData.push({ [column]: rowData[column] });
      });
      return orderedData;
    });
  }

  private convertToCSV(tableData: { [key: string]: any }[][]): string {
    const header = tableData[0].map((item) => Object.keys(item)[0]);
    const rowsData = tableData.map((row) => {
      return row.map((item) => Object.values(item)[0]);
    });
    const csvData = [header].concat(rowsData);
    return csvData.map((it) => it.toString()).join("\n");
  }

  private addClassName(element: HTMLElement, className: string) {
    element.classList.add(className);
  }

  private removeClassName(element: HTMLElement, className: string) {
    element.classList.remove(className);
  }

  private removeCellBlueSelection(cell: CellComponent | null) {
    if (cell) {
      this.removeClassName(cell.getElement(), TABULATOR_CELL_SELECTED_CLASS);
    }
  }

  private removeRowsBlueSelection() {
    this.blueSelectedRows.forEach((row) => {
      const rowNumCellElement = row.getCell("row number").getElement();
      this.removeClassName(row.getElement(), TABULATOR_ROW_SELECTED_CLASS);
      this.removeClassName(rowNumCellElement, TABULATOR_ROWNUM_SELECTED_CLASS);
    });

    this.blueSelectedRows = [];
  }

  private removeRowsNativeSelection() {
    this.nativeSelectedRows.forEach((row) => {
      row.deselect();
    });
    this.nativeSelectedRows = [];
  }

  private keydownHandler = (event: KeyboardEvent) => {
    this.isCtrlPressed = event.ctrlKey;
  };

  private keyupHandler = (event: KeyboardEvent) => {
    if (event.key === "Control") {
      this.isCtrlPressed = false;
    }
  };
}
