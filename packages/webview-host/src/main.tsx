import type { FileSystemProvider } from "@frdy/sdk";
import "./actions";
import { EE } from "./actions";
import { fs, host } from "./bootstrapChannels";
import "./index.css";

addEventListener("focus", () => host.onFocus());

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const wnd = window as any;

// biome-ignore lint/performance/noDelete: <explanation>
delete wnd.parent;

wnd.faraday = {
  events: EE,
  fs: fs as FileSystemProvider,
};
