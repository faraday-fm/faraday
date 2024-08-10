import { useMemo } from "react";
import type { FileExtension, FullyQualifiedQuickView } from "../extensions/types";
import { useQuickViews } from "./useQuickViews";

export function useQuickViewsByFileExtension() {
  const { quickViews } = useQuickViews();
  return useMemo(() => {
    const result: Record<FileExtension, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([qvId, qv]) => {
      if (!qv.definition || !qv.isActive) {
        return;
      }
      const quickView = qv.definition;
      if (qv.definition.extensions) {
        qv.definition.extensions.forEach((ext) => {
          (result[ext] ??= []).push({
            extId: qvId,
            quickView: quickView,
            extensionPath: qv.extensionPath,
          });
        });
      }
    });
    return result;
  }, [quickViews]);
}
