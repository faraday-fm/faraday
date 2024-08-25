import { FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { Theme, ThemeSchema } from "../schemas/theme";
import { combine } from "../utils/path";
import { Extension, ExtensionsContext } from "./extensionContext";
import { readFileJson } from "./fsUtils";
import { SettingsContext } from "./settingsContext";

export type ThemeContext = {
  theme: Promise<{ extension: Extension; path: string, theme: Theme }>;
};

export const themeContext = createContext<ThemeContext>(Symbol("theme"));

export function createThemeContext(fs: FileSystemProvider, settingsCtx: SettingsContext, extCtx: ExtensionsContext): ThemeContext {
  const loadTheme = async () => {
    const settings = await settingsCtx.settings;
    const exts = await extCtx.extensions;
    const themeExt = exts.find((e) => e.themeDefinitions.has(settings.themeId));
    if (themeExt) {
      const themeDefinition = themeExt.themeDefinitions.get(settings.themeId)!;
      const themeFile = combine(themeExt.path, themeDefinition.path);
      const theme = await readFileJson(fs, themeFile, ThemeSchema);
      return { extension: themeExt, path: themeFile, theme };
    }
    throw new Error("No Icon Theme defined");
  };

  return { theme: loadTheme() };
}
