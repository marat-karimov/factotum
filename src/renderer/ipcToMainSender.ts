export function sendSqlToRun(value: string) {
  window.api.send("sqlToRun", value);
}

export function sendSqlToValidate(value: string) {
  window.api.send("sqlToValidate", value);
}

export function sendSearchBoxHidden() {
  window.api.send("searchBoxHidden");
}

export function sendCopyToClipboard(value: string) {
  window.api.send("copyToClipboard", value);
}
