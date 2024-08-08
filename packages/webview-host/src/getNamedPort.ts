import * as Comlink from "comlink";
import type { WebView } from "./types";

const comlinkEndpoint = Comlink.windowEndpoint(window.parent);
const host = Comlink.wrap<WebView>(comlinkEndpoint);

// HACK: it looks like the webview script is invoked synchronously right after iframe.src is set.
// Thus, we have to wait a bit, while getNamedPort handler is registered on the other side.
await new Promise((r) => setTimeout(r));

export function getNamedPort(name: string) {
  return host.getNamedPort(name);
}
