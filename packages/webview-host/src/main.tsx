import type { FileSystemProvider } from "@frdy/sdk";
import "./actions";
import { EE } from "./actions";
import { fs, host } from "./bootstrapChannels";
import "./index.css";

addEventListener("focus", () => host.onFocus());

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const wnd = window as any;

// WHY NOT WORKS? In vscode they do it, and it works fine.
// https://github.com/microsoft/vscode/blob/4b78857fd9c934cab979171380573452ffdc612e/src/vs/workbench/contrib/webview/browser/pre/index.html#L224C6-L224C24
// delete wnd.top;

// biome-ignore lint/performance/noDelete: <explanation>
delete wnd.parent;
// biome-ignore lint/performance/noDelete: <explanation>
delete wnd.frameElement;

wnd.faraday = {
  events: EE,
  fs: fs as FileSystemProvider,
};
