import { type PropsWithChildren } from "react";
import { ThemeContext } from "./ThemeContext";
import type { Theme } from "./types";

export function ThemeProvider({ theme, children }: PropsWithChildren<{ theme: Theme }>) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
