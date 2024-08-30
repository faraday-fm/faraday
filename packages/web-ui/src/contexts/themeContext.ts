import { FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { effect, signal, Signal } from "@preact/signals-core";
import { ReactiveControllerHost } from "lit";
import { Theme, ThemeSchema } from "../schemas/theme";
import { combine } from "../utils/path";
import { Extension } from "./extensionContext";
import { readFileJson } from "./fsUtils";
import { SettingsContext } from "./settingsContext";

export type ThemeContext = { extension: Extension; path: string; theme: Theme } | { error: unknown } | undefined;

export const themeContext = createContext<ThemeContext>(Symbol("theme"));

export function createThemeProvider(
  host: ReactiveControllerHost & HTMLElement,
  fsSignal: Signal<FileSystemProvider | undefined>,
  extensionsSignal: Signal<Extension[]>,
  settingsSignal: Signal<SettingsContext>
) {
  const themeSignal = signal<ThemeContext>();
  const context = new ContextProvider(host, { context: themeContext, initialValue: themeSignal.valueOf() });

  effect(() => {
    const fs = fsSignal.value;
    if (!fs) {
      return;
    }
    const { themeId } = settingsSignal.value.settings;
    if (!themeId) {
      return;
    }
    const extensions = extensionsSignal.value;

    const controller = new AbortController();
    const loadTheme = async () => {
      try {
        const extension = extensions.find((e) => e.themeDefinitions.has(themeId));
        if (extension) {
          const themeDefinition = extension.themeDefinitions.get(themeId)!;
          const themeFile = combine(extension.path, themeDefinition.path);
          const theme = await readFileJson(fs, themeFile, ThemeSchema, { signal: controller.signal });
          themeSignal.value = { extension, path: themeFile, theme };
        } else {
          themeSignal.value = undefined;
        }
      } catch (error) {
        console.error("Unable to load theme:", error);
        themeSignal.value = { error };
      }
      context.setValue(themeSignal.valueOf());
    };

    loadTheme();

    return () => controller.abort();
  });

  return { themeSignal };
}
