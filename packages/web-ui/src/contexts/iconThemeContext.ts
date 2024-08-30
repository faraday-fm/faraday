import { FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { IconTheme, IconThemeSchema } from "../schemas/iconTheme";
import { combine } from "../utils/path";
import { Extension } from "./extensionContext";
import { readFileJson } from "./fsUtils";
import { SettingsContext } from "./settingsContext";
import { ReactiveControllerHost } from "lit";
import { effect, signal, Signal } from "@preact/signals-core";

export type IconThemeContext = { extension: Extension; path: string; theme: IconTheme } | { error: unknown } | undefined;

export const iconThemeContext = createContext<IconThemeContext>(Symbol("icon-theme"));

export function createIconThemeProvider(
  host: ReactiveControllerHost & HTMLElement,
  fsSignal: Signal<FileSystemProvider | undefined>,
  extensionsSignal: Signal<Extension[]>,
  settingsSignal: Signal<SettingsContext>
) {
  const iconThemeSignal = signal<IconThemeContext>();
  const context = new ContextProvider(host, { context: iconThemeContext, initialValue: iconThemeSignal.valueOf() });

  effect(() => {
    const fs = fsSignal.value;
    if (!fs) {
      return;
    }
    const { iconThemeId } = settingsSignal.value.settings;
    if (!iconThemeId) {
      return;
    }
    const exts = extensionsSignal.value;

    const controller = new AbortController();
    const loadIconTheme = async () => {
      try {
        const extension = exts.find((e) => e.iconThemeDefinitions.has(iconThemeId));
        if (extension) {
          const themeDefinition = extension.iconThemeDefinitions.get(iconThemeId)!;
          const path = combine(extension.path, themeDefinition.path);
          const theme = await readFileJson(fs, path, IconThemeSchema, { signal: controller.signal });
          iconThemeSignal.value = { extension: extension, path, theme };
        } else {
          iconThemeSignal.value = undefined;
        }
      } catch (error) {
        iconThemeSignal.value = { error };
      }
      context.setValue(iconThemeSignal.valueOf());
    };

    loadIconTheme();

    return () => controller.abort();
  });

  return { iconThemeSignal };
}
