import { produce } from "immer";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { QuickViewDefinition } from "../../schemas/manifest";

type QuickViewId = string;

export interface QuickView {
  isActive: boolean;
  definition?: QuickViewDefinition;
  extensionPath: string;
}

export const quickViewsAtom = atom<Record<QuickViewId, QuickView>>({});

export function useQuickViews() {
  const [quickViews, setQuickViews] = useAtom(quickViewsAtom);

  const activateQuickView = useCallback(
    (id: QuickViewId) =>
      setQuickViews(
        produce((state) => {
          if (state[id]) {
            state[id].isActive = true;
          }
        }),
      ),
    [setQuickViews],
  );
  const deactivateQuickView = useCallback(
    (id: QuickViewId) =>
      setQuickViews(
        produce((state) => {
          if (state[id]) {
            state[id].isActive = false;
          }
        }),
      ),
    [setQuickViews],
  );
  const setQuickViewDefinition = useCallback(
    (id: QuickViewId, extensionPath: string, definition?: QuickViewDefinition) =>
      setQuickViews(
        produce((state) => {
          const qv = (state[id] ??= { isActive: false, extensionPath });
          qv.extensionPath = extensionPath;
          qv.definition = definition;
        }),
      ),
    [setQuickViews],
  );

  return {
    quickViews,
    activateQuickView,
    deactivateQuickView,
    setQuickViewDefinition,
  };
}
