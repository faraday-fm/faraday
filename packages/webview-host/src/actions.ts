import * as Comlink from "comlink";
import EventEmitter from "eventemitter3";
import { actionsPort, host } from "./bootstrapChannels";
import "./index.css";
import type { WebViewActions } from "./types";
import { readFile, RealPathControlByte } from "@frdy/sdk";

export const EE = new EventEmitter();

async function importModule() {
  const settings = await host.getSettings();
  const rp = await faraday.fs.realpath(settings.pwd, RealPathControlByte.NO_CHECK, [settings.scriptPath]);
  const result = await readFile(faraday.fs, rp.files[0].path);
  const blob = new Blob([result], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  return await import(url);
}

let module: any;
let active = true;
let lastActivefile:string|undefined;

const actions: WebViewActions = {
  setIsActive(isActive) {
    active = isActive;
    if (isActive) {
      module?.activate?.();
      if (lastActivefile !== faraday.activefile) {
        EE.emit("activefilechange", faraday.activefile);
      }
    } else {
      module?.deactivate?.();
    }
  },
  setTheme(theme) {
    const style = document.getElementById("default_style")!;
    style.innerHTML = `body{font-family:${theme.fontFamily};background-color:${theme.colors["panel.background"]};color:${theme.colors.foreground}}a{color:${theme.colors["textLink.foreground"]}}`;
    faraday.theme = theme;
    EE.emit("themechange", theme);
  },
  setActiveFilepath(filepath) {
    faraday.activefile = filepath;
    if (active) {
      lastActivefile = filepath;
      EE.emit("activefilechange", filepath);
    }
  },
  async loadScript() {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    module = (await importModule()) as any;
  },
};
Comlink.expose(actions, actionsPort);
