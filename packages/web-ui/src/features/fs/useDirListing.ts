import { useEffect } from "react";
import { type List, createList } from "../../utils/immutableList";
import { iterateDir } from "./iterateDir";
import type { Dirent } from "./types";
import { useFs } from "./useFs";

export function useDirListing(path: string | undefined, onListUpdated: (path: string, files: List<Dirent>) => void) {
  const fs = useFs();

  useEffect(() => {
    if (!path) return undefined;

    const abortController = new AbortController();
    void (async () => {
      let items = createList<Dirent>();
      try {
        for await (const dirents of iterateDir(fs, path, abortController.signal)) {
          dirents.forEach((d) => (items = items.append(d)));
        }
        onListUpdated(path, items);
      } catch (err) {
        console.error(err);
        onListUpdated(path, items);
      }
    })();
    return () => abortController.abort();
  }, [fs, onListUpdated, path]);
}
