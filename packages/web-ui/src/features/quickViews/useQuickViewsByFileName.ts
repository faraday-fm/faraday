import { useMemo } from "react";
import type { FileName, FullyQualifiedQuickView } from "../extensions/types";
import { useQuickViews } from "./useQuickViews";

export function useQuickViewsByFileName() {
  const { quickViews } = useQuickViews();
  return useMemo(() => {
    const result: Record<FileName, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([qvId, qv]) => {
      if (!qv.definition || !qv.isActive) {
        return;
      }
      const quickView = qv.definition;
      if (qv.definition.filenames) {
        qv.definition.filenames.forEach((fileName) => {
          (result[fileName] ??= []).push({
            extId: qvId,
            quickView,
            extensionPath: qv.extensionPath,
          });
        });
      }
    });
    return result;
  }, [quickViews]);
}
