import type { Theme } from "@frdy/sdk";
import "./actions";
import { EE, startActionsListener } from "./actions";
import { onFocus } from "./events";
import { fs } from "./fs";
import "./index.css";

addEventListener("focus", onFocus);

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const wnd = window as any;

// biome-ignore lint/performance/noDelete: <explanation>
delete wnd.parent;

wnd.faraday = {
  theme: undefined as unknown as Theme,
  events: EE,
  fs
} satisfies typeof faraday;

await startActionsListener();
