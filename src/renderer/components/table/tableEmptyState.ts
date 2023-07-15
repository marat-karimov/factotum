import { messages } from "../../../messages";

export function renderEmptyState() {
  const emptyState = `<div id="empty-state-container"><div id="empty-state">${messages.tableEmptyState}</div></div>`;
  document.getElementById("table-container").innerHTML = emptyState;
}
