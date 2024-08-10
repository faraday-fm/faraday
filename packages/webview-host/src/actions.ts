import * as Comlink from "comlink";
import EventEmitter from "eventemitter3";
import { actionsPort } from "./bootstrapChannels";
import "./index.css";
import type { WebViewActions } from "./types";

export const EE = new EventEmitter();

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function startActionsListener(module: any) {
  const actions: WebViewActions = {
    setIsActive(isActive) {
      if (isActive) {
        module.activate?.();
      } else {
        module.deactivate?.();
      }
    },
    setTheme(theme) {
      faraday.theme = theme;
      const style = document.getElementById("default_style")!;
      style.innerHTML = `body{font-family:${theme.fontFamily};background-color:${theme.colors["panel.background"]};color:${theme.colors.foreground}}a{color:${theme.colors["textLink.foreground"]}}`;
      EE.emit("themechange", theme);
    },
    setActiveFilepath(filepath) {
      faraday.activefile = filepath;
      EE.emit("activefilechange", filepath);
    },
  };
  Comlink.expose(actions, actionsPort);
  module.activate?.();
}
