import { useMemo } from "react";
import type { FileName, FullyQualifiedCustomPanel } from "../extensions/types";
import { useCustomPanels } from "./useCustomPanels";

export function useCustomPanelsByFileName() {
  const { customPanels } = useCustomPanels();
  return useMemo(() => {
    const result: Record<FileName, FullyQualifiedCustomPanel[]> = {};
    const customPanelsByExtension = Object.entries(customPanels);
    customPanelsByExtension.forEach(([extId, cp]) => {
      if (!cp.definition || !cp.isActive) {
        return;
      }
      const customPanel = cp.definition;
      if (cp.definition.filenames) {
        cp.definition.filenames.forEach((fileName) => {
          (result[fileName] ??= []).push({
            extId,
            customPanel,
            extensionPath: cp.extensionPath,
          });
        });
      }
    });
    return result;
  }, [customPanels]);
}
