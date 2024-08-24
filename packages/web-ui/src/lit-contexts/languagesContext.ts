import { FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { ExtensionsContext } from "./extensionContext";

export type LanguagesContext = {
  getLanguageByFilename(filename: string): Promise<string | undefined>;
};

export const languagesContext = createContext<LanguagesContext>(Symbol("languages"));

export function createLanguagesContext(fs: FileSystemProvider, extCtx: ExtensionsContext): LanguagesContext {
  return {
    getLanguageByFilename: async (filename: string) => {
      const extensions = await extCtx.extensions;
      for (const ext of extensions) {
        for (const [id, lang] of ext.languageDefinitions) {
          if (lang.filenames) {
            for (const fn of lang.filenames) {
              if (fn === filename) {
                return lang.id;
              }
            }
          }
          if (lang.extensions) {
            for (const ext of lang.extensions) {
              if (filename.endsWith(ext)) {
                return lang.id;
              }
            }
          }
        }
      }
    },
  };
}
