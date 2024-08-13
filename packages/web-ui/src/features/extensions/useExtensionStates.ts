import { produce } from "immer";
import { atom, useSetAtom } from "jotai";
import { useMemo } from "react";
import type { ExtensionManifest } from "../../schemas/manifest";
import { createWorker } from "./extWorker";

type ExtId = string;

export interface ExtensionState {
  isActive: boolean;
  manifest?: ExtensionManifest;
}

export const extensionStatesAtom = atom<Record<ExtId, ExtensionState>>({});

let w: any;

export function useExtensionStates() {
  const setExtensionStates = useSetAtom(extensionStatesAtom);
  return useMemo(
    () => ({
      setExtensionManifest: (extId: string, manifest?: ExtensionManifest) => {
        if (manifest?.browser) {
          console.error("Creating Worker", extId)
          w = createWorker(manifest.browser);
        }
        setExtensionStates(
          produce((s) => {
            (s[extId] ??= { isActive: false }).manifest = manifest;
          }),
        );
      },
      activateExtension: (extId: string) => {
        setExtensionStates(
          produce((s) => {
            (s[extId] ??= { isActive: true }).isActive = true;
          }),
        );
      },
      deactivateExtension: (extId: string) => {
        setExtensionStates(
          produce((s) => {
            (s[extId] ??= { isActive: false }).isActive = false;
          }),
        );
      },
    }),
    [setExtensionStates],
  );
}
