import { type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { ExtensionManifest, IconThemeDefinition, LanguageDefinition, ThemeDefinition } from "../schemas/manifest";
import { combine } from "../utils/path";
import { ExtensionRepoContext } from "./extensionRepoContext";
import { readFileJson } from "./fsUtils";

export type Extension = {
  path: string;
  loadingError?: unknown;
  manifest: ExtensionManifest | undefined;
  iconThemeDefinitions: Map<string, IconThemeDefinition>;
  themeDefinitions: Map<string, ThemeDefinition>;
  languageDefinitions: Map<string, LanguageDefinition>;
};

export type ExtensionsContext = {
  extensions: Promise<Extension[]>;
};

export const extensionsContext = createContext<ExtensionsContext>(Symbol("extensions"));

async function loadExt(fs: FileSystemProvider, path: string, id: { uuid: string }, loc: string): Promise<Extension> {
  const extensionLocation = `${combine(path + "/", loc)}/`;
  try {
    const manifestLocation = combine(extensionLocation, "package.json");
    const manifest = await readFileJson(fs, manifestLocation, ExtensionManifest);
    const themeDefinitions = new Map(manifest.contributes?.themes?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.label}`, t]));
    const iconThemeDefinitions = new Map(manifest.contributes?.iconThemes?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.id}`, t]));
    const languageDefinitions = new Map(manifest.contributes?.languages?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.id}`, t]));
    console.info("Themes:", themeDefinitions);
    console.info("Icon Themes:", iconThemeDefinitions);
    console.info("Languages:", languageDefinitions);
    return { path: extensionLocation, manifest, themeDefinitions, iconThemeDefinitions, languageDefinitions };
  } catch (err) {
    console.error("Unable to load extension:", path);
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

export function createExtensionsContext(fs: FileSystemProvider, extRepoCtx: ExtensionRepoContext): ExtensionsContext {
  const { repo, path } = extRepoCtx;
  return { extensions: repo.then((r) => Promise.all(r.map((e) => loadExt(fs, path, e.identifier, e.relativeLocation)))) };
}
