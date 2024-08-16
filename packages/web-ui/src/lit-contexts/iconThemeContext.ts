import { FileSystemProvider } from "@frdy/sdk";
import { Extension, ExtensionsContext } from "./extensionContext";
import { readFileJson, realpath } from "./fsUtils";
import { SettingsContext } from "./settingsContext";
import { IconTheme, IconThemeSchema } from "../schemas/iconTheme";
import { createContext } from "@lit/context";
import { combine } from "../utils/path";

export type IconThemeContext = {
  iconTheme: Promise<{ extension: Extension; path: string, theme: IconTheme }>;
};

export const iconThemeContext = createContext<IconThemeContext>(Symbol("icon-theme"));

export function createIconThemeContext(fs: FileSystemProvider, settingsCtx: SettingsContext, extCtx: ExtensionsContext): IconThemeContext {
  const loadIconTheme = async () => {
    const settings = await settingsCtx.settings;
    const exts = await extCtx.extensions;
    const iconThemeExt = exts.find((e) => e.iconThemeDefinitions.has(settings.iconThemeId));
    if (iconThemeExt) {
      const themeDefinition = iconThemeExt.iconThemeDefinitions.get(settings.iconThemeId)!;
      const iconThemeFile = combine(iconThemeExt.path, themeDefinition.path);
      const theme = await readFileJson(fs, iconThemeFile, IconThemeSchema);
      return { extension: iconThemeExt, path: iconThemeFile, theme };
    }
    throw new Error("No Icon Theme defined");
  };

  return { iconTheme: loadIconTheme() };
}
