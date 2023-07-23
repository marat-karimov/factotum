import { TabulatorFull as Tabulator, ColumnDefinition } from "tabulator-tables";
import { TableClickHandler as TableClickHandler } from "./tableClickHandler";

import { TableSearch } from "./tableSearch";
import { TableForRender } from "../../../types/types";
import { renderSpinner } from "../spinner/spinner";

export class TableRenderer {
  private latestData: TableForRender = null;
  private tableSearch: TableSearch;
  private table: Tabulator;
  private tableClickHandler: TableClickHandler;

  public renderNewTable = (data: TableForRender) => {
    this.renderTable(data);

    this.latestData = data;
  };

  public renderSearchBox = () => {
    this.tableSearch.renderSearchBox();
  };

  public hideSearchBox = () => {
    this.tableSearch.hideSearchBox();
  };

  public renderLatestTable = () => {
    if (this.latestData) {
      this.renderTable(this.latestData);
    }
  };

  private renderTable(data: TableForRender) {
    this.cleanup();

    renderSpinner();

    this.tableClickHandler = new TableClickHandler(data.columns);

    const columnDefinitions = this.getColumnDefinitions(data.columns);

    this.table = new Tabulator("#table-container", {
      data: data.tableData,
      columns: columnDefinitions,
      renderHorizontal: "virtual",
    });

    this.tableSearch = new TableSearch(this.table);
  }

  private cleanup(): void {
    if (this.table) {
      this.table.destroy();
      this.table = null;
    }
    if (this.tableSearch) {
      this.tableSearch.destroy();
      this.tableSearch = null;
    }
    if (this.tableClickHandler) {
      this.tableClickHandler.destroy();
      this.tableClickHandler = null;
    }
  }

  private getColumnDefinitions(columns: string[]): ColumnDefinition[] {
    return [
      {
        title: "",
        field: "row number",
        formatter: "rownum",
        headerSort: false,
        cellClick: this.tableClickHandler.handleRowNumberClick,
      },
      ...columns.map((column) => ({
        title: column,
        field: column,
        cellClick: this.tableClickHandler.handleCellClick,
      })),
    ];
  }
}
