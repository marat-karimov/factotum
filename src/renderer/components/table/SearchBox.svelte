<script lang="ts">

  let searchField: HTMLInputElement;
  let searchBoxContainer: HTMLDivElement;
  export let totalMatchesCount: number = 0;
  export let currentMatchIndex: number = 0;
  
  export let isVisible: boolean = false;

  export let onNext: () => void = () => {};
  export let onPrev: () => void = () => {};
  export let onClose: () => void = () => {};
  export let onSearch: (value: string) => void = () => {};
</script>

<div bind:this={searchBoxContainer} id="search-container" class:visible={isVisible}>
  <button on:click={onNext} id="next-button">Next</button>
  <button on:click={onPrev} id="prev-button">Previous</button>
  <button on:click={onClose} id="close-button">Close</button>
  <input bind:this={searchField} on:input={() => onSearch(searchField.value)} id="search-field" type="text">
  <div id="total-matches">{totalMatchesCount}</div>
  <div id="current-match">{currentMatchIndex}</div>
</div>
