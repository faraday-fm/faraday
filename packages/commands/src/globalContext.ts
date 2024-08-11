import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

export interface GlobalContext {
  "filePanel.activeName"?: string;
  "filePanel.path"?: string;
  "filePanel.isFileActive"?: boolean;
  "filePanel.isDirectoryActive"?: boolean;
}

const globalContextAtom = atom<GlobalContext>({});

export function useGlobalContext() {
  return useAtomValue(globalContextAtom);
}

export function useUpdateGlobalContext() {
  const setGlobalContext = useSetAtom(globalContextAtom);

  return useCallback((newState: Partial<GlobalContext>) => setGlobalContext((ctx) => ({ ...ctx, ...newState })), [setGlobalContext]);
}
