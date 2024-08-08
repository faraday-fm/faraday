import * as Comlink from "comlink";
import EventEmitter from "eventemitter3";
import { setError } from "./error";
import "./index.css";
import type { WebViewActions } from "./types";
import { getNamedPort } from "./getNamedPort";

export const EE = new EventEmitter();

const actions: WebViewActions = {
  async setTheme(theme) {
    faraday.theme = theme;
    const style = document.getElementById("default_style")!;
    style.innerHTML = `body{font-family:${theme.fontFamily};background-color:${theme.colors["panel.background"]};color:${theme.colors.foreground}}a{color:${theme.colors["textLink.foreground"]}}`;
    EE.emit("themechange", theme);
  },
  async setScript(script) {
    try {
      const m = await import(`data:text/javascript;base64,${btoa(script)}`);
      m.init?.();
      resolveModule(m);
    } catch (err) {
      setError(err);
    }
  },
  async setContent({ content, path }) {
    setError(undefined);
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const module: any = await modulePromise;
      module.updateContent?.({ content, path });
    } catch (err) {
      setError(err);
    }
  },
};

export async function startActionsListener() {
  Comlink.expose(actions, await getNamedPort("actions"));
}

const { resolve: resolveModule, promise: modulePromise } = Promise.withResolvers();
