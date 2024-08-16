import { readFile, type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";

export type IconsCache = {
  getDefaultIcon(isDir: boolean, isOpen: boolean): string;
  getIcon(name: string): Promise<string>;
};

export const iconsCacheContext = createContext<IconsCache>(Symbol("icons-cache"));

const defaultDirIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.11-.9-2-2-2h-8l-2-2z" fill="#90a4ae" /></svg>',
);
const defaultDirOpenIcon = btoa(
  '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M28.96692,12H9.44152a2,2,0,0,0-1.89737,1.36754L4,24V10H28a2,2,0,0,0-2-2H15.1241a2,2,0,0,1-1.28038-.46357L12.5563,6.46357A2,2,0,0,0,11.27592,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H26l4.80523-11.21213A2,2,0,0,0,28.96692,12Z" fill="#90a4ae" /></svg>',
);
const defaultFileIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m5 2H6v16h12v-9h-7V4z" fill="#90a4ae" /></svg>',
);

export function createIconsCache(fs: FileSystemProvider): IconsCache {
  const cache = new Map<string, Promise<string>>();
  const decoder = new TextDecoder();
  return {
    getDefaultIcon(isDir, isOpen) {
      return isDir ? (isOpen ? defaultDirOpenIcon : defaultDirIcon) : defaultFileIcon;
    },
    async getIcon(name) {
      const ext = name.split('.').at(-1) ?? "";
      const cachedIcon = cache.get(ext);
      if (cachedIcon) {
        return cachedIcon;
      }
      const result = readFile(fs, "/Users/mike/github/faraday-fm/faraday/apps/faraday-fm.github.io/src/assets/faraday-fs/faraday.svg").then((buf) =>
        decoder.decode(buf),
      );
      cache.set(ext, result);
      return result;
    },
  };
}
