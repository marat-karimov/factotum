import { sendCopyToClipboard } from "./ipcToMainSender";

export function ctrlCHandler(value: unknown) {
  // Check if the Ctrl+C has been pressed
  document.onkeydown = function (e) {
    if (e.ctrlKey && e.key == "c") {
      // send data to be copied to the main process
      sendCopyToClipboard(String(value))
    }
  };
}