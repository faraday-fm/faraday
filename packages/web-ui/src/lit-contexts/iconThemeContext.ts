import { FileSystemProvider } from "@frdy/sdk";
import { Extension, ExtensionsContext } from "./extensionContext";
import { readFileJson, realpath } from "./fsUtils";
import { SettingsContext } from "./settingsContext";
import { IconTheme, IconThemeSchema } from "../schemas/iconTheme";
import { createContext } from "@lit/context";

export type IconThemeContext = {
  iconTheme: Promise<{ extension: Extension; path: string, theme: IconTheme } | undefined>;
};

export const iconThemeContext = createContext<IconThemeContext>(Symbol("icon-theme"));

export function createIconThemeContext(fs: FileSystemProvider, settingsCtx: SettingsContext, extCtx: ExtensionsContext): IconThemeContext {
  const loadIconTheme = async () => {
    const settings = await settingsCtx.settings;
    const exts = await extCtx.extensions;
    const iconThemeExt = exts.find((e) => e.iconThemeDefinitions.has(settings.iconThemeId));
    if (iconThemeExt) {
      const themeDefinition = iconThemeExt.iconThemeDefinitions.get(settings.iconThemeId)!;
      const iconThemeFile = await realpath(fs, iconThemeExt.path, themeDefinition.path);
      const theme = await readFileJson(fs, iconThemeFile, IconThemeSchema);
      return { extension: iconThemeExt, path: iconThemeFile, theme };
    }
    return undefined;
  };

  return { iconTheme: loadIconTheme() };
}
