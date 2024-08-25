import { ReactiveController, ReactiveControllerHost } from "lit";
import { ThemeContext } from "./themeContext";

export class CssVarsProvider implements ReactiveController {
  #host: ReactiveControllerHost & HTMLElement;
  #style = document.createElement("style");

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.#host = host;
    host.addController(this);
    this.#style.innerHTML = localStorage.getItem("cached-theme") ?? "";
  }

  async setThemeContext(themeCtx: ThemeContext) {
    if (this.#style) {
      const themeDesc = await themeCtx.theme;
      const { theme } = themeDesc;
      let vars = Object.entries(theme.colors ?? {});
      if (themeDesc.theme.fontFamily) {
        vars.push(["fontFamily", themeDesc.theme.fontFamily]);
      }

      const body = vars.map(([k, v]) => `--${k.replaceAll(".", "-").replaceAll(":", "-")}: ${v}`).join(";");
      this.#style.innerHTML = `body {${body}}`;
      localStorage.setItem("cached-theme", this.#style.innerHTML);
    }
  }

  hostConnected(): void {
    this.#host.prepend(this.#style);
  }

  hostDisconnected(): void {
    this.#style.remove();
  }
}
