import type { Dirent } from "@frdy/sdk";
import { useEffect } from "react";
import { type List, createList } from "../../utils/immutableList";
import { iterateDir } from "./iterateDir";
import { useFs } from "./useFs";

export function useDirListing(
  path: string | undefined, 
  onListUpdated: (path: string, files: List<Dirent>) => void,
  onError?: (path: string, error: string) => void
) {
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
        console.error('[useDirListing] Error reading directory:', { path, error: err });
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (onError) {
          onError(path, errorMessage);
        } else {
          onListUpdated(path, items);
        }
      }
    })();
    return () => abortController.abort();
  }, [fs, onListUpdated, onError, path]);
}
