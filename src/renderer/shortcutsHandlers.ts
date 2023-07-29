import { sendCopyToClipboard } from "./toMainSender";
import Mousetrap from "mousetrap";

export function ctrlCHandler(value: unknown) {
  Mousetrap.bind(["ctrl+c", "command+c"], () => {
    sendCopyToClipboard(String(value));
  });
  Mousetrap.unbind(["ctrl", "command"]);
}
