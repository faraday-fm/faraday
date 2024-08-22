import { Theme } from "@frdy/sdk";
import { ReactiveController, ReactiveControllerHost } from "lit";

export class CssVarsProvider implements ReactiveController {
  #host: ReactiveControllerHost & HTMLElement;
  #style = document.createElement("style");

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.#host = host;
    host.addController(this);
  }

  setTheme(theme: Theme) {
    if (this.#style) {
      let vars = Object.entries(theme.colors);
      vars.push(["fontFamily", theme.fontFamily]);

      const body = vars.map(([k, v]) => `--${k.replaceAll(".", "-").replaceAll(":", "-")}: ${v}`).join(";");
      this.#style.innerHTML = `body {${body}}`;
    }
  }

  hostConnected(): void {
    this.#host.prepend(this.#style);
  }

  hostDisconnected(): void {
    this.#style.remove();
  }
}
