import * as Comlink from "comlink";
import EventEmitter from "eventemitter3";
import { setError } from "./error";
import "./index.css";
import type { WebViewActions } from "./types";
import { getNamedPort } from "./getNamedPort";
import "systemjs";
import { readFile, RealPathControlByte } from "@frdy/sdk";

export const EE = new EventEmitter();

const systemJSPrototype = System.constructor.prototype;

systemJSPrototype.resolve = (id: string, parentUrl: string) => {
  if (!parentUrl) {
    return id;
  }
  const segments = parentUrl.split('/');
  segments.length = segments.length - 1;
  return `${segments.join('/')}/${id}`;
};

systemJSPrototype.shouldFetch = () => true;

systemJSPrototype.fetch = async (url: string) => {
  const result = await readFile(url);
  const blob = new Blob([result]);
  return new Response(blob, {headers: {"Content-Type": "text/javascript"}});
};

const actions: WebViewActions = {
  async setTheme(theme) {
    faraday.theme = theme;
    const style = document.getElementById("default_style")!;
    style.innerHTML = `body{font-family:${theme.fontFamily};background-color:${theme.colors["panel.background"]};color:${theme.colors.foreground}}a{color:${theme.colors["textLink.foreground"]}}`;
    EE.emit("themechange", theme);
  },
  async setScriptPath(pwdPath, scriptPath) {
    try {
      console.error("!@#", pwdPath, scriptPath);
      const rp = await faraday.fs.realpath(pwdPath, RealPathControlByte.NO_CHECK, [scriptPath]);
      console.error("RP", rp.files[0].path);
      const m = await System.import(rp.files[0].path);
      console.error("!!");
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (m as any).init?.();
    } catch (err) {
      console.error(err);
      setError(err);
    }
  },
  async setActiveFilepath(filepath) {
    faraday.activefile = filepath;
    EE.emit("activefilechange", filepath);
  },
};

export async function startActionsListener() {
  Comlink.expose(actions, await getNamedPort("actions"));
}
