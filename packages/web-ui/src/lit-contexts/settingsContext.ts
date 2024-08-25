import { type FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { effect, signal, Signal } from "@preact/signals-core";
import { ReactiveControllerHost } from "lit";
import { Settings } from "../schemas/settings";
import { readFileJson } from "./fsUtils";

export type SettingsContext = {
  settings: Settings;
  error?: unknown;
};

export const settingsContext = createContext<SettingsContext>(Symbol("settings"));

export function createSettingsContextProvider(host: ReactiveControllerHost & HTMLElement, fsSignal: Signal<FileSystemProvider | undefined>) {
  const settingsSignal = signal<SettingsContext>({ settings: {} });
  const context = new ContextProvider(host, { context: settingsContext, initialValue: settingsSignal.valueOf() });

  const loadSettings = (fs: FileSystemProvider | undefined) => {
    if (!fs) {
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        settingsSignal.value = { settings: await readFileJson(fs, ".faraday/settings.json", Settings, { signal: controller.signal }) };
      } catch (error) {
        settingsSignal.value = { ...settingsSignal.value, error };
      }
      context.setValue(settingsSignal.valueOf());
    })();
    return () => controller.abort();
  };

  effect(() => {
    const fs = fsSignal.value;
    const cancelLoading = loadSettings(fs);
    return cancelLoading;
  });

  return {
    settingsSignal,
    setShowHiddenFiles: (showHiddenFiles: boolean) => {
      settingsSignal.value = { ...settingsSignal.value, settings: { ...settingsSignal.value.settings, showHiddenFiles } };
      context.setValue(settingsSignal.valueOf());
      console.error("***")
    },
  };
}
