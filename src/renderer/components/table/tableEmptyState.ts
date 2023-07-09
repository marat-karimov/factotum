export function renderEmptyState() {
  const emptyState =
    '<div id="empty-state-container"><div id="empty-state">Your data will be displayed here</div></div>';
  document.getElementById("table-container").innerHTML = emptyState;
}
