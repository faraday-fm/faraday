import { type FileSystemProvider } from "@frdy/sdk";
import { ContextProvider, createContext } from "@lit/context";
import { effect, signal, Signal } from "@preact/signals-core";
import { IconTheme, isSvgIcon } from "../schemas/iconTheme";
import { combine, filename } from "../utils/path";
import { Extension } from "./extensionContext";
import { readFileString } from "./fsUtils";
import { IconThemeContext } from "./iconThemeContext";
import { ReactiveControllerHost } from "lit";

export type IconsCache = {
  getIcon(name: string, isDir: boolean, isOpen: boolean): Promise<string>;
};

export const iconsCacheContext = createContext<IconsCache>(Symbol("icons-cache"));

export function createIconsCache(
  host: ReactiveControllerHost & HTMLElement,
  fsSignal: Signal<FileSystemProvider | undefined>,
  iconThemeSignal: Signal<IconThemeContext>,
  extensionsSignal: Signal<Extension[]>
) {
  const iconsCache = signal<IconsCache>({
    getIcon: () => {
      throw new Error();
    },
  });
  const context = new ContextProvider(host, { context: iconsCacheContext, initialValue: iconsCache.valueOf() });

  const cache = new Map<string, Promise<string>>();
  effect(() => {
    const fs = fsSignal.value;
    if (!fs) {
      return;
    }
    const extensions = extensionsSignal.value;
    const iconTheme = iconThemeSignal.value;

    iconsCache.value = {
      getIcon: async (name, isDir, isOpen) => {
        if (!iconTheme || "error" in iconTheme) {
          throw new Error("Cannot resolve Icon Theme path.");
        }
        const iconDefinitionName = resolveIconDefinitionName(iconTheme.theme, extensions, name, isDir, isOpen);
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
    context.setValue(iconsCache.valueOf());
  });

  return { iconsCache };
}

function resolveIconDefinitionName(iconTheme: IconTheme, extensions: Extension[], path: string, isDir: boolean, isOpen: boolean, languageId?: string): string {
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
  const language = getLanguageByFilename(direntName, extensions);
  if (language) {
    result = iconTheme.languageIds?.[language];
    if (result) {
      return result;
    }
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

function getLanguageByFilename(filename: string, extensions: Extension[]) {
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
}
