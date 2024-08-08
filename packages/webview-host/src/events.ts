import * as Comlink from "comlink";
import { getNamedPort } from "./getNamedPort";
import type { WebViewEvents } from "./types";

const eventsPort = await getNamedPort("events");

const events = Comlink.wrap<WebViewEvents>(eventsPort);

export async function onFocus() {
  await events.onFocus();
}
