import { produce } from "immer";
import { atom, useAtom } from "jotai";
import { useCallback } from "react";
import type { CustomPanelDefinition } from "../../schemas/manifest";

type CustomPanelId = string;

export interface CustomPanel {
  isActive: boolean;
  definition?: CustomPanelDefinition;
  extensionPath: string;
}

export const customPanelsAtom = atom<Record<CustomPanelId, CustomPanel>>({});

export function useCustomPanels() {
  const [customPanels, setCustomPanels] = useAtom(customPanelsAtom);

  const activateCustomPanel = useCallback(
    (id: CustomPanelId) =>
      setCustomPanels(
        produce((state) => {
          if (state[id]) {
            state[id].isActive = true;
          }
        }),
      ),
    [setCustomPanels],
  );
  const deactivateCustomPanel = useCallback(
    (id: CustomPanelId) =>
      setCustomPanels(
        produce((state) => {
          if (state[id]) {
            state[id].isActive = false;
          }
        }),
      ),
    [setCustomPanels],
  );
  const setCustomPanelDefinition = useCallback(
    (id: CustomPanelId, extensionPath: string, definition?: CustomPanelDefinition) =>
      setCustomPanels(
        produce((state) => {
          const qv = (state[id] ??= { isActive: false, extensionPath });
          qv.extensionPath = extensionPath;
          qv.definition = definition;
        }),
      ),
    [setCustomPanels],
  );

  return {
    customPanels,
    activateCustomPanel,
    deactivateCustomPanel,
    setCustomPanelDefinition,
  };
}
