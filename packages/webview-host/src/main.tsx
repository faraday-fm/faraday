import type { Theme } from "@frdy/sdk";
import EventEmitter from "eventemitter3";
import "./actions";
import { onFocus } from "./events";
import "./index.css";

const EE = new EventEmitter();
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const wnd = window as any;

addEventListener("focus", () => onFocus());
// biome-ignore lint/performance/noDelete: <explanation>
delete wnd.parent;

wnd.faraday = {
  theme: undefined as unknown as Theme,
  events: EE,
  fs: {
    readFile(filename: string) {
      return Promise.resolve(filename);
    },
  },
} satisfies typeof faraday;
