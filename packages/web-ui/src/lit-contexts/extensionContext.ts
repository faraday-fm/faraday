import { type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { ExtensionManifest, IconThemeDefinition } from "../schemas/manifest";
import { ExtensionRepoContext } from "./extensionRepoContext";
import { readFileJson, realpath } from "./fsUtils";

export type Extension = {
  path: string;
  manifest: ExtensionManifest;
  iconThemeDefinitions: Map<string, IconThemeDefinition>;
};

export type ExtensionsContext = {
  extensions: Promise<Extension[]>;
};

export const extensionsContext = createContext<ExtensionsContext>(Symbol("extensions"));

async function loadExt(fs: FileSystemProvider, path: string, id: { uuid: string }, loc: string): Promise<Extension> {
  const extensionLocation = await realpath(fs, path, loc);
  const manifestLocation = await realpath(fs, extensionLocation, "package.json");
  const manifest = await readFileJson(fs, manifestLocation, ExtensionManifest);
  const iconThemes = new Map(manifest.contributes?.iconThemes?.map((t) => [`${manifest.publisher}.${manifest.name}.${t.id}`, t]));
  return { path: extensionLocation, manifest, iconThemeDefinitions: iconThemes };
}

export function createExtensionsContext(fs: FileSystemProvider, extRepoCtx: ExtensionRepoContext): ExtensionsContext {
  const { repo, path } = extRepoCtx;
  return { extensions: repo.then((r) => Promise.all(r.map((e) => loadExt(fs, path, e.identifier, e.relativeLocation)))) };
}
