import { useMemo } from "react";
import type { FullyQualifiedQuickView, Mimetype } from "../extensions/types";
import { useQuickViews } from "./useQuickViews";

export function useQuickViewsByMimetype() {
  const { quickViews } = useQuickViews();
  return useMemo(() => {
    const result: Record<Mimetype, FullyQualifiedQuickView[]> = {};
    const quickViewsByExtension = Object.entries(quickViews);
    quickViewsByExtension.forEach(([qvId, qv]) => {
      if (!qv.definition || !qv.isActive) {
        return;
      }
      const quickView = qv.definition;
      if (qv.definition.mimetypes) {
        qv.definition.mimetypes.forEach((type) => {
          (result[type] ??= []).push({
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
