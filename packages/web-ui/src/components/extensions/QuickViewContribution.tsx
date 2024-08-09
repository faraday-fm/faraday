import { memo, useEffect } from "react";
import { useQuickViews } from "../../features/quickViews/hooks";
import type { ExtensionManifest, QuickViewDefinition } from "../../schemas/manifest";
import { getQuickViewId } from "./utils";

export const QuickViewContribution = memo(function QuickViewContribution({
  path,
  manifest,
  quickView,
}: {
  path: string;
  manifest: ExtensionManifest;
  quickView: QuickViewDefinition;
}) {
  const id = getQuickViewId(manifest, quickView);
  const { activateQuickView, deactivateQuickView, setQuickViewDefinition } = useQuickViews();

  useEffect(() => {
    setQuickViewDefinition(id, path, quickView);
  }, [id, quickView, path, setQuickViewDefinition]);

  useEffect(() => {
    activateQuickView(id);

    return () => {
      deactivateQuickView(id);
    };
  }, [activateQuickView, deactivateQuickView, id]);

  return null;
});
