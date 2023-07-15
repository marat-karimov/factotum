import { ToMainChannels, ToMainDataTypes } from "../types/types";

export function sendSqlToRun(value: ToMainDataTypes[ToMainChannels.SqlToRun]) {
  window.api.send(ToMainChannels.SqlToRun, value);
}

export function sendSqlToValidate(
  value: ToMainDataTypes[ToMainChannels.SqlToValidate]
) {
  window.api.send(ToMainChannels.SqlToValidate, value);
}

export function sendSearchBoxHidden() {
  window.api.send(ToMainChannels.SearchBoxHidden);
}

export function sendCopyToClipboard(
  value: ToMainDataTypes[ToMainChannels.CopyToClipboard]
) {
  window.api.send(ToMainChannels.CopyToClipboard, value);
}
