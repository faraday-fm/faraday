import * as Comlink from "comlink";
import type { WebViewEvents } from "./types";

const comlinkEndpoint = Comlink.windowEndpoint(window.parent, self);
const events = Comlink.wrap<WebViewEvents>(comlinkEndpoint);

export function onFocus() {
  return events.onFocus();
}