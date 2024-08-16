import { type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { ExtensionRepo, ExtensionRepoSchema } from "../schemas/extensionRepo";
import { readFileJson } from "./fsUtils";

export type ExtensionRepoContext = {
  path: string;
  repo: Promise<ExtensionRepo>;
};

export const extensionRepoContext = createContext<ExtensionRepoContext>(Symbol("extension-repo"));

export function createExtensionRepoContext(fs: FileSystemProvider): ExtensionRepoContext {
  console.info("Loading extensions list...");
  return {
    path: ".faraday/extensions",
    repo: readFileJson(fs, ".faraday/extensions/extensions.json", ExtensionRepoSchema),
  };
}
