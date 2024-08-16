import { type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { IconTheme, isSvgIcon } from "../schemas/iconTheme";
import { combine, filename } from "../utils/path";
import { readFileString } from "./fsUtils";
import { IconThemeContext } from "./iconThemeContext";

export type IconsCache = {
  getIcon(name: string, isDir: boolean, isOpen: boolean): Promise<string>;
};

export const iconsCacheContext = createContext<IconsCache>(Symbol("icons-cache"));

export function createIconsCache(fs: FileSystemProvider, iconThemeContext: IconThemeContext): IconsCache {
  const cache = new Map<string, Promise<string>>();
  return {
    async getIcon(name, isDir, isOpen) {
      const iconTheme = await iconThemeContext.iconTheme;
      const iconDefinitionName = resolveIconDefinitionName(iconTheme.theme, name, isDir, isOpen);
      const cachedIcon = cache.get(iconDefinitionName);
      if (cachedIcon) {
        return cachedIcon;
      }
      const iconDefinition = iconTheme.theme.iconDefinitions[iconDefinitionName];
      const iconPath = isSvgIcon(iconDefinition) ? iconDefinition.iconPath : undefined;
      const iconPathAbsolute = iconPath ? combine(iconTheme.path, iconPath) : undefined;
      if (!iconPathAbsolute) {
        throw new Error("Cannot resolve Icon Theme path.");
      }

      const svgContent = readFileString(fs, iconPathAbsolute);
      const svgPromise = svgContent.then((svg) => btoa(svg));
      cache.set(iconDefinitionName, svgPromise);
      return svgPromise;
    },
  };
}

function resolveIconDefinitionName(iconTheme: IconTheme, path: string, isDir: boolean, isOpen: boolean, languageId?: string): string {
  const defaultDef = isDir ? (isOpen ? iconTheme.folderExpanded ?? iconTheme.folder : iconTheme.folder) : iconTheme.file;
  const direntName = filename(path);
  if (!direntName) {
    return defaultDef;
  }
  if (isDir) {
    return (isOpen ? iconTheme.folderNamesExpanded?.[direntName] : iconTheme.folderNames?.[direntName]) ?? defaultDef;
  }
  let result = iconTheme.fileNames?.[direntName];
  if (result) {
    return result;
  }
  const nameParts = direntName.split(".");
  if (nameParts.length < 2) {
    return defaultDef;
  }
  for (let i = nameParts.length - 1; i > 0; i -= 1) {
    const ext = nameParts.slice(i).join(".");
    result = iconTheme.fileExtensions?.[ext];
    if (result) {
      return result;
    }
    result = languageId && iconTheme.languageIds?.[languageId];
    if (result) {
      return result;
    }
  }
  return defaultDef;
}
