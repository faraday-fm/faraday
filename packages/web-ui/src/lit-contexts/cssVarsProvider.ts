import { effect, Signal } from "@preact/signals-core";
import { ReactiveControllerHost } from "lit";
import { ThemeContext } from "./themeContext";

export function createCssVarsProvider(host: ReactiveControllerHost & HTMLElement, themeSignal: Signal<ThemeContext>) {
  const style = document.createElement("style");
  style.innerHTML = localStorage.getItem("cached-theme") ?? "";
  host.prepend(style);

  effect(() => {
    const themeDesc = themeSignal.value;
    if (themeDesc && !("error" in themeDesc)) {
      const { theme } = themeDesc;
      let vars = Object.entries(theme.colors ?? {});
      if (themeDesc.theme.fontFamily) {
        vars.push(["fontFamily", themeDesc.theme.fontFamily]);
      }

      const body = vars.map(([k, v]) => `--${k.replaceAll(".", "-").replaceAll(":", "-")}: ${v}`).join(";");
      style.innerHTML = `body {${body}}`;
    } else {
      style.innerHTML = "";
    }
    localStorage.setItem("cached-theme", style.innerHTML);
  });
}
