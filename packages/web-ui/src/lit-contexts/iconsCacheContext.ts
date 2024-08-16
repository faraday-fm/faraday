import { type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { IconTheme, isSvgIcon } from "../schemas/iconTheme";
import { combine, filename } from "../utils/path";
import { readFileString } from "./fsUtils";
import { IconThemeContext } from "./iconThemeContext";

export type IconsCache = {
  getDefaultIcon(isDir: boolean, isOpen: boolean): string;
  getIcon(name: string, isDir: boolean, isOpen: boolean): Promise<string>;
};

export const iconsCacheContext = createContext<IconsCache>(Symbol("icons-cache"));

const defaultDirIcon = btoa(
  '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M13.84376,7.53645l-1.28749-1.0729A2,2,0,0,0,11.27591,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2H15.12412A2,2,0,0,1,13.84376,7.53645Z" fill="#90a4ae" /></svg>'
);
const defaultDirOpenIcon = btoa(
  '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M28.96692,12H9.44152a2,2,0,0,0-1.89737,1.36754L4,24V10H28a2,2,0,0,0-2-2H15.1241a2,2,0,0,1-1.28038-.46357L12.5563,6.46357A2,2,0,0,0,11.27592,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H26l4.80523-11.21213A2,2,0,0,0,28.96692,12Z" fill="#90a4ae" /></svg>'
);
const defaultFileIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m5 2H6v16h12v-9h-7V4z" fill="#90a4ae" /></svg>'
);

export function createIconsCache(fs: FileSystemProvider, iconThemeContext: IconThemeContext): IconsCache {
  const cache = new Map<string, Promise<string>>();
  return {
    getDefaultIcon(isDir, isOpen) {
      return isDir ? (isOpen ? defaultDirOpenIcon : defaultDirIcon) : defaultFileIcon;
    },
    async getIcon(name, isDir, isOpen) {
      const iconTheme = await iconThemeContext.iconTheme;
      if (!iconTheme) {
        return this.getDefaultIcon(isDir, isOpen);
      }
      const iconDefinitionName = resolveIconDefinitionName(iconTheme.theme, name, isDir, isOpen);
      const cachedIcon = cache.get(iconDefinitionName);
      if (cachedIcon) {
        return cachedIcon;
      }
      const iconDefinition = iconTheme.theme.iconDefinitions[iconDefinitionName];
      const iconPath = isSvgIcon(iconDefinition) ? iconDefinition.iconPath : undefined;
      const iconPathAbsolute = iconPath ? combine(iconTheme.path, iconPath) : undefined;
      if (!iconPathAbsolute) {
        return this.getDefaultIcon(isDir, isOpen);
      }

      try {
        const svgContent = readFileString(fs, iconPathAbsolute);
        const svgPromise = svgContent.then((svg) => btoa(svg));
        cache.set(iconDefinitionName, svgPromise);
        return svgPromise;
      } catch {
        return this.getDefaultIcon(isDir, isOpen);
      }
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
