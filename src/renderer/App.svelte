<script>
  import SearchBox from "./components/table/SearchBox.svelte";
  import 'svelte'

</script>
<div class="container">
    <div class="schema-container", id="schema-container">
      <div id="schema-empty-state-container">
        <div>Virtual database schema is here</div>
      </div>
      <div id="schema"></div>
    </div>

    <div class="right">
      <div class="small_element" , id="sql-editor-container">
        <div class="content">
          <textarea id="sql-editor">--Your SQL editor is here</textarea>
        </div>
      </div>
      
<SearchBox/>

      <div class="small_element" , id="table-container">
        <div class="content"></div>
      </div>
    </div>
  </div>

  <div class="full_width"><div>
    <ul id="logs-output"></ul>
  </div>
  </div>

  <div id="info-panel">
    <div class="corner-elements">
        <span id="engine"></span> 
        <span id="memory-usage"></span>
    </div>
</div>