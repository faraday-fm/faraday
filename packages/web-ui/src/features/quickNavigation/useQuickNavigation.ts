import { type RefObject, useContext, useEffect, useState } from "react";
import { QuickNavigationContext } from "./QuickNavigationContext";

export function useQuickNavigation(ref: RefObject<HTMLElement | null>, text: string) {
  const context = useContext(QuickNavigationContext);
  const [hotKey, setHotKey] = useState<string>();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    let key: string | undefined;
    for (const c of text) {
      const l = c.toLowerCase();
      if (!context.has(l)) {
        context.set(l, ref as RefObject<HTMLElement>);
        key = l;
        break;
      }
    }
    setHotKey(key);
    return () => {
      if (key) context.delete(key);
    };
  }, [context, ref, text]);

  return hotKey;
}
