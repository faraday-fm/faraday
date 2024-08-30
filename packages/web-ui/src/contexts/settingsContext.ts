import { type FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { effect, signal, Signal } from "@preact/signals-core";
import { ReactiveControllerHost } from "lit";
import { Settings } from "../schemas/settings";
import { readFileJson } from "./fsUtils";
import { produce } from "immer";

export type SettingsContext = {
  settings: Settings;
  updateSettings: (updateFn: (settings: Settings) => void) => void;
  error?: unknown;
};

export const settingsContext = createContext<SettingsContext>(Symbol("settings"));

export function createSettingsContextProvider(host: ReactiveControllerHost & HTMLElement, fsSignal: Signal<FileSystemProvider | undefined>) {
  const settingsSignal = signal<SettingsContext>({ settings: {}, updateSettings: (updateFn) => updateSettings(updateFn) });
  const context = new ContextProvider(host, { context: settingsContext, initialValue: settingsSignal.valueOf() });

  effect(() => {
    context.setValue(settingsSignal.value);
  });

  effect(() => {
    const fs = fsSignal.value;
    if (!fs) {
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const settings = await readFileJson(fs, ".config/faraday/settings.json", Settings, { signal: controller.signal });
        settingsSignal.value = produce(settingsSignal.valueOf(), (v) => {
          v.settings = settings;
        });
      } catch (error) {
        settingsSignal.value = produce(settingsSignal.valueOf(), (v) => {
          v.error = error;
        });
      }
    })();

    return () => controller.abort();
  });

  const updateSettings = (updateFn: (settings: Settings) => void) => {
    settingsSignal.value = produce(settingsSignal.valueOf(), (ctx) => {
      updateFn(ctx.settings);
    });
  };

  return {
    settingsSignal,
  };
}
