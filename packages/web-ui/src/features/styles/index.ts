import { useLayoutEffect, useState } from "react";
import frdyStyles from "../../assets/styles.css";
import type { Theme } from "../../features/themes";

export function useStyles(theme: Theme): boolean {
  const [colorsEl] = useState(() => (typeof document === "object" ? document.createElement("style") : undefined));
  const [stylesEl] = useState(() => (typeof document === "object" ? document.createElement("style") : undefined));

  useLayoutEffect(() => {
    if (colorsEl) {
      document.head.appendChild(colorsEl);
      return () => colorsEl.remove();
    }
  }, [colorsEl]);

  useLayoutEffect(() => {
    if (stylesEl) {
      document.head.appendChild(stylesEl);
      return () => stylesEl.remove();
    }
  }, [stylesEl]);

  useLayoutEffect(() => {
    if (!colorsEl || !stylesEl) {
      return;
    }
    const colorVariables = Object.entries(theme.colors)
      .concat([["fontFamily", theme.fontFamily]])
      .map(([key, val]) => `--${key.replaceAll(/[.:]/g, "-")}:${val};`)
      .join("\n");
    const frdyColors = `.frdy{${colorVariables}}`;
    colorsEl.innerHTML = frdyColors;
    stylesEl.innerHTML = frdyStyles;
  }, [colorsEl, stylesEl, theme]);

  return !!colorsEl && !!stylesEl;
}

export function css(className: string, ...options: string[]) {
  if (options.length > 0) {
    return `frdy ${className} ${options.join(" ")}`;
  }
  return `frdy ${className}`;
}
