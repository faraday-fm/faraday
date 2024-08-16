import { type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { ExtensionManifest, IconThemeDefinition } from "../schemas/manifest";
import { combine } from "../utils/path";
import { ExtensionRepoContext } from "./extensionRepoContext";
import { readFileJson } from "./fsUtils";

export type Extension = {
  path: string;
  loadingError?: unknown;
  manifest: ExtensionManifest | undefined;
  iconThemeDefinitions: Map<string, IconThemeDefinition>;
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
    const iconThemes = new Map(manifest.contributes?.iconThemes?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.id}`, t]));
    return { path: extensionLocation, manifest, iconThemeDefinitions: iconThemes };
  } catch (err) {
    console.error("Unable to load extension:", path);
    return { path: extensionLocation, loadingError: err, manifest: undefined, iconThemeDefinitions: new Map() };
  }
}

export function createExtensionsContext(fs: FileSystemProvider, extRepoCtx: ExtensionRepoContext): ExtensionsContext {
  const { repo, path } = extRepoCtx;
  return { extensions: repo.then((r) => Promise.all(r.map((e) => loadExt(fs, path, e.identifier, e.relativeLocation)))) };
}
