import { type FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { ExtensionRepo, ExtensionRepoSchema } from "../schemas/extensionRepo";
import { readFileJson } from "./fsUtils";
import { ReactiveControllerHost } from "lit";
import { effect, signal, Signal } from "@preact/signals-core";

export type ExtensionRepoContext = {
  path: string;
  repo: ExtensionRepo;
  error?: unknown;
};

export const extensionRepoContext = createContext<ExtensionRepoContext>(Symbol("extension-repo"));

export function createExtensionRepoProvider(host: ReactiveControllerHost & HTMLElement, fsSignal: Signal<FileSystemProvider | undefined>) {
  const path = ".faraday/extensions";
  const extensionRepoSignal = signal<ExtensionRepoContext>({ path, repo: [] });
  const context = new ContextProvider(host, { context: extensionRepoContext, initialValue: extensionRepoSignal.valueOf() });

  effect(() => {
    const fs = fsSignal.value;
    if (!fs) {
      return;
    }

    const controller = new AbortController();
    const loadExtensions = () => {
      console.info("Loading extensions list...");
      (async () => {
        try {
          extensionRepoSignal.value = {
            path,
            repo: await readFileJson(fs, ".faraday/extensions/extensions.json", ExtensionRepoSchema, { signal: controller.signal }),
          };
        } catch (error) {
          console.error("Unable to load extensions list", error);
          extensionRepoSignal.value = { path, repo: [], error };
        }
        context.setValue(extensionRepoSignal.valueOf());
      })();
    };

    loadExtensions();
    return () => controller.abort();
  });

  return { extensionRepoSignal };
}
