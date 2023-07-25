<script lang="ts">
    import { writable, Writable } from 'svelte/store';
    import { TabulatorFull as Tabulator, RowComponent } from "tabulator-tables";
    import { ScrollDirection } from "./tableSearchBox";
    import { sendSearchBoxHidden } from "../../toMainSender";
    import SearchBox from './SearchBox.svelte';
  
    export let table: Tabulator;
  
    let currentRowIndex = 0;
    let rowsMatched: RowComponent[] = [];
    const debounceDelay = 1000;
  
    const totalMatchesCount: Writable<number> = writable(0);
    const currentMatchIndex: Writable<number> = writable(0);
  
    let handleNext: () => void = () => scrollToElement(1);
    let handlePrev: () => void = () => scrollToElement(-1);
    let handleClose: () => void = () => {
      hideSearchBox();
      sendSearchBoxHidden();
    };
    let handleSearch: (value: string) => void = debounce(async (value) => await handleInputValue(value), debounceDelay);
  
    function resetState(): void {
      table.deselectRow("all");
      rowsMatched = [];
      currentRowIndex = 0;
      currentMatchIndex.set(0);
      totalMatchesCount.set(0);
    }
  
    async function handleInputValue(value: unknown): Promise<void> {
      resetState();
      if (!value) {
        return;
      }
      const columns = table.getColumns().map((column) => column.getField());
      const matchedRows = getMatchedRows(columns, value);
      rowsMatched = Array.from(matchedRows);
      totalMatchesCount.set(rowsMatched.length);
      if (rowsMatched.length) {
        selectFirstMatchedRow();
      }
    }
  
    function getMatchedRows(columns: string[], value: unknown): Set<RowComponent> {
      const matchedRows = new Set<RowComponent>();
      for (const column of columns) {
        const rowsMatched = table.searchRows(column, "like", value);
        for (const row of rowsMatched) {
          matchedRows.add(row);
        }
      }
      return matchedRows;
    }
  
    function selectFirstMatchedRow(): void {
      selectVisibleMatchedRows();
      table.scrollToRow(rowsMatched[0], "top", false);
      currentMatchIndex.set(1);
    }
  
    function selectVisibleMatchedRows() {
      if (!rowsMatched.length) {
        return;
      }
      const visibleRows = table.getRows("visible");
      const matchedVisibleRows = visibleRows.filter((row) => rowsMatched.includes(row));
      table.selectRow(matchedVisibleRows);
    }
  
    function debounce(func: (value: string) => Promise<void>, wait: number) {
      let timeout: NodeJS.Timeout | undefined;
      return async function executedFunction(value: string) {
        const later = async () => {
          clearTimeout(timeout);
          await func(value);
        };
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  
    function scrollToElement(direction: ScrollDirection) {
      const newIndex = currentRowIndex + direction;
  
      if (newIndex < 0 || newIndex >= rowsMatched.length) {
        console.log("No more elements to scroll to");
        return;
      }
  
      currentRowIndex = newIndex;
      const row = rowsMatched[currentRowIndex];
      table.selectRow([row]);
      table.scrollToRow(row, "top", false);
      currentMatchIndex.set(currentRowIndex + 1);
    }
  
    function hideSearchBox() {
      resetState();
    }
  

</script>

<!-- svelte-ignore missing-declaration -->
<SearchBox 
        onNext={handleNext} 
        onPrev={handlePrev} 
        onClose={handleClose} 
        onSearch={handleSearch} 
        currentMatchIndex={$currentMatchIndex}
        totalMatchesCount={$totalMatchesCount}
    />
