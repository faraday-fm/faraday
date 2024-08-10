import { type ReactElement, useEffect, useState } from "react";
import { useQuickView } from "../../../features/quickViews";
import { css } from "../../../features/styles";
import type { QuickViewDefinition } from "../../../schemas/manifest";
import { QuickViewInstance, type QuickViewInstanceActions } from "./QuickViewInstance";
import { useGlobalContext } from "../../../features/globalContext";

interface QVInstance {
  quickView: QuickViewDefinition;
  element: ReactElement;
  actions: PromiseWithResolvers<QuickViewInstanceActions>;
}

export default function QuickViewHost() {
  const [instances, setInstances] = useState<Record<string, QVInstance>>({});
  const { "filePanel.path": path } = useGlobalContext();

  const quickView = useQuickView(path);
  const key = quickView ? `${quickView.extId}.${quickView.quickView.id}` : undefined;

  useEffect(() => {
    setInstances((frames) => {
      const newFrames = { ...frames };
      let frame: QVInstance | undefined;
      if (key && quickView) {
        frame = frames[key];
        if (!frame) {
          const qw = (
            <QuickViewInstance
              key={key}
              ref={(r: QuickViewInstanceActions | null) => {
                if (r) {
                  newFrames[key].actions.resolve(r);
                }
              }}
              pwdPath={quickView.extensionPath}
              scriptPath={quickView.quickView.path}
            />
          );
          frame = {
            quickView: quickView.quickView,
            element: qw,
            actions: Promise.withResolvers(),
          };
          newFrames[key] = frame;
        }
      }
      Object.values(newFrames).forEach((f) => void f.actions.promise.then((a) => a.setIsActive(f.element === frame?.element)));
      return newFrames;
    });
  }, [key, quickView]);

  return <div className={css("quick-view-host")}>{Object.values(instances).map((f) => f.element)}</div>;
}
