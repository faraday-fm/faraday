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
    setInstances((instances) => {
      const newInstances = { ...instances };
      let instance: QVInstance | undefined;
      if (key && quickView) {
        instance = instances[key];
        if (!instance) {
          const element = (
            <QuickViewInstance
              key={key}
              ref={(r) => {
                if (r) {
                  newInstances[key]!.actions.resolve(r);
                }
              }}
              quickView={quickView}
            />
          );
          instance = {
            quickView: quickView.quickView,
            element: element,
            actions: Promise.withResolvers(),
          };
          newInstances[key] = instance;
        }
      }
      Object.values(newInstances).forEach((f) => void f.actions.promise.then((a) => a.setIsActive(f.element === instance?.element)));
      return newInstances;
    });
  }, [key, quickView]);

  return <div className={css("quick-view-host")}>{Object.values(instances).map((f) => f.element)}</div>;
}
