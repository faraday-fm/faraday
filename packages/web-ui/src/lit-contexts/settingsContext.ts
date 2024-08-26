import { type FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { effect, signal, Signal } from "@preact/signals-core";
import { ReactiveControllerHost } from "lit";
import { Settings } from "../schemas/settings";
import { readFileJson } from "./fsUtils";

export type SettingsContext = {
  settings: Settings;
  showHiddenFiles: (show: boolean) => void;
  error?: unknown;
};

export const settingsContext = createContext<SettingsContext>(Symbol("settings"));

export function createSettingsContextProvider(host: ReactiveControllerHost & HTMLElement, fsSignal: Signal<FileSystemProvider | undefined>) {
  const settingsSignal = signal<SettingsContext>({ settings: {}, showHiddenFiles: (show) => setShowHiddenFiles(show) });
  const context = new ContextProvider(host, { context: settingsContext, initialValue: settingsSignal.valueOf() });

  effect(() => {
    const fs = fsSignal.value;
    if (!fs) {
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        settingsSignal.value = {
          showHiddenFiles: setShowHiddenFiles,
          settings: await readFileJson(fs, ".faraday/settings.json", Settings, { signal: controller.signal }),
        };
      } catch (error) {
        settingsSignal.value = { ...settingsSignal.value, error };
      }
      context.setValue(settingsSignal.valueOf());
    })();
    
    return () => controller.abort();
  });

  const setShowHiddenFiles = (showHiddenFiles: boolean) => {
    settingsSignal.value = { ...settingsSignal.valueOf(), settings: { ...settingsSignal.valueOf().settings, showHiddenFiles } };
    context.setValue(settingsSignal.valueOf());
  };

  return {
    settingsSignal,
  };
}
