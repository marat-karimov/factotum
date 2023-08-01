import { FromRendererToMain, ToMainDataTypes } from "../types/types";

export function sendSqlToRun(value: ToMainDataTypes[FromRendererToMain.SqlToRun]) {
  window.api.send(FromRendererToMain.SqlToRun, value);
}

export function sendSqlToValidate(
  value: ToMainDataTypes[FromRendererToMain.SqlToValidate]
) {
  window.api.send(FromRendererToMain.SqlToValidate, value);
}

export function sendSearchBoxHidden() {
  window.api.send(FromRendererToMain.SearchBoxHidden);
}

export function sendCopyToClipboard(
  value: ToMainDataTypes[FromRendererToMain.CopyToClipboard]
) {
  window.api.send(FromRendererToMain.CopyToClipboard, value);
}
