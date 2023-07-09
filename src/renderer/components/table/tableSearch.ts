import { TabulatorFull as Tabulator, RowComponent } from "tabulator-tables";
import { ScrollDirection, TableSearchBox } from "./tableSearchBox";
import { sendSearchBoxHidden } from "../../ipcToMainSender";

const debounceDelay = 1000;

export class TableSearch {
  private currentRowIndex = 0;
  private rowsMatched: RowComponent[] = [];
  private table: Tabulator;
  private searchBox: TableSearchBox;

  constructor(table: Tabulator) {
    this.table = table;
    this.table.on("scrollVertical", () => {
      this.selectVisibleMatchedRows();
    });
    this.initSearchBox();
  }

  private initSearchBox() {
    this.searchBox = new TableSearchBox();

    this.searchBox.setCurrentMatchIndex(this.currentRowIndex);
    this.searchBox.setTotalMatchesCount(this.rowsMatched.length);
    this.searchBox.nextButton.onclick = () => this.scrollToElement(1);
    this.searchBox.prevButton.onclick = () => this.scrollToElement(-1);
    this.searchBox.closeButton.onclick = () => this.hideSearchBox();

    this.searchBox.searchField.oninput = this.debounce(async () => {
      const value = this.searchBox.getSearchFieldValue();
      await this.handleInputValue(value);
    }, debounceDelay);
  }

  public destroy() {
    this.searchBox.nextButton.onclick = null;
    this.searchBox.prevButton.onclick = null;
    this.searchBox.closeButton.onclick = null;
    this.searchBox.searchField.oninput = null;
    this.table.destroy();
    this.table = null;
    this.rowsMatched = null;
    this.currentRowIndex = null;
  }

  public renderSearchBox() {
    this.searchBox.renderSearchBox();
  }

  public hideSearchBox() {
    this.searchBox.hideSearchBox();
    this.resetState();
    sendSearchBoxHidden();
  }

  private resetState() {
    this.table.deselectRow("all");
    this.rowsMatched = [];
    this.currentRowIndex = 0;
    this.searchBox.setCurrentMatchIndex(0);
    this.searchBox.setTotalMatchesCount(0);
  }

  private async handleInputValue(value: unknown): Promise<void> {
    this.resetState();

    if (!value) {
      return;
    }

    const columns = this.table.getColumns().map((column) => column.getField());
    const matchedRows = this.getMatchedRows(columns, value);
    this.rowsMatched = Array.from(matchedRows);

    this.searchBox.setTotalMatchesCount(this.rowsMatched.length);

    if (this.rowsMatched.length) {
      this.selectFirstMatchedRow();
    }
  }

  private getMatchedRows(columns: string[], value: unknown): Set<RowComponent> {
    const matchedRows = new Set<RowComponent>();
    for (const column of columns) {
      const rowsMatched = this.table.searchRows(column, "like", value);
      for (const row of rowsMatched) {
        matchedRows.add(row);
      }
    }
    return matchedRows;
  }

  private selectFirstMatchedRow(): void {
    this.selectVisibleMatchedRows();
    this.table.scrollToRow(this.rowsMatched[0], "top", false);
    this.searchBox.setCurrentMatchIndex(1);
  }

  private selectVisibleMatchedRows() {
    if (!this.rowsMatched.length) {
      return;
    }
    const visibleRows = this.table.getRows("visible");
    const matchedVisibleRows = visibleRows.filter((row) =>
      this.rowsMatched.includes(row)
    );
    this.table.selectRow(matchedVisibleRows);
  }

  private debounce(func: () => Promise<void>, wait: number) {
    let timeout: NodeJS.Timeout | undefined;
    return async function executedFunction() {
      const later = async () => {
        clearTimeout(timeout);
        await func();
      };
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  private scrollToElement(direction: ScrollDirection) {
    const newIndex = this.currentRowIndex + direction;

    if (newIndex < 0 || newIndex >= this.rowsMatched.length) {
      console.log("No more elements to scroll to");
      return;
    }

    this.currentRowIndex = newIndex;
    const row = this.rowsMatched[this.currentRowIndex];
    this.table.selectRow([row]);
    this.table.scrollToRow(row, "top", false);
    this.searchBox.setCurrentMatchIndex(this.currentRowIndex + 1);
  }
}
