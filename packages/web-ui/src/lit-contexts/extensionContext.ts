import { type FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { ExtensionManifest, IconThemeDefinition, LanguageDefinition, ThemeDefinition } from "../schemas/manifest";
import { combine } from "../utils/path";
import { ExtensionRepoContext } from "./extensionRepoContext";
import { readFileJson } from "./fsUtils";
import { effect, signal, Signal } from "@preact/signals-core";
import { ReactiveControllerHost } from "lit";

export type Extension = {
  path: string;
  loadingError?: unknown;
  manifest?: ExtensionManifest;
  iconThemeDefinitions: Map<string, IconThemeDefinition>;
  themeDefinitions: Map<string, ThemeDefinition>;
  languageDefinitions: Map<string, LanguageDefinition>;
};

export const extensionsContext = createContext<Extension[]>(Symbol("extensions"));

async function loadExt(fs: FileSystemProvider, path: string, id: { uuid: string }, loc: string, signal: AbortSignal): Promise<Extension> {
  const extensionLocation = `${combine(path + "/", loc)}/`;
  try {
    const manifestLocation = combine(extensionLocation, "package.json");
    const manifest = await readFileJson(fs, manifestLocation, ExtensionManifest, { signal });
    const themeDefinitions = new Map(manifest.contributes?.themes?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.label}`, t]));
    const iconThemeDefinitions = new Map(manifest.contributes?.iconThemes?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.id}`, t]));
    const languageDefinitions = new Map(manifest.contributes?.languages?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.id}`, t]));
    console.info("Themes:", themeDefinitions);
    console.info("Icon Themes:", iconThemeDefinitions);
    console.info("Languages:", languageDefinitions);
    return { path: extensionLocation, manifest, themeDefinitions, iconThemeDefinitions, languageDefinitions };
  } catch (err) {
    console.error("Unable to load extension", path, err);
    return {
      path: extensionLocation,
      loadingError: err,
      manifest: undefined,
      themeDefinitions: new Map(),
      iconThemeDefinitions: new Map(),
      languageDefinitions: new Map(),
    };
  }
}

export function createExtensionsProvider(
  host: ReactiveControllerHost & HTMLElement,
  fsSignal: Signal<FileSystemProvider | undefined>,
  extRepoCtxSignal: Signal<ExtensionRepoContext>
) {
  const extensionsSignal = signal<Extension[]>([]);
  const context = new ContextProvider(host, { context: extensionsContext, initialValue: [] });
  effect(() => {
    const fs = fsSignal.value;
    if (!fs) {
      return;
    }
    const extRepoCtx = extRepoCtxSignal.value;
    const { repo, path } = extRepoCtx;
    const controller = new AbortController();
    (async () => {
      const loadingResults = await Promise.allSettled(repo.map((e) => loadExt(fs, path, e.identifier, e.relativeLocation, controller.signal)));
      const extensions = loadingResults.map((r) => {
        if (r.status === "fulfilled") {
          return r.value;
        } else {
          return { path, loadingError: r.reason, iconThemeDefinitions: new Map(), languageDefinitions: new Map(), themeDefinitions: new Map() };
        }
      });
      extensionsSignal.value = extensions;
      context.setValue(extensions);
    })();
    return () => controller.abort();
  });
  return { extensionsSignal };
}
