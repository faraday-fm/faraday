import { type PropsWithChildren, type RefObject, useCallback, useMemo, useRef } from "react";
import { QuickNavigationContext } from "./QuickNavigationContext";

export function QuickNavigationProvider({ children }: PropsWithChildren) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapping = useMemo(() => new Map<string, RefObject<HTMLElement>>(), []);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          {
            const tabbedElements = containerRef.current?.querySelectorAll("input, button, select, textarea, a[href]");
            const elementsArray = Array.from(tabbedElements?.values() ?? []) as HTMLElement[];
            let currIndex = elementsArray.indexOf(e.target as HTMLElement);
            if (currIndex >= 0) {
              currIndex -= 1;
              if (currIndex < 0) currIndex = elementsArray.length - 1;
              elementsArray[currIndex]?.focus();
            }
          }
          break;
        case "ArrowDown":
          {
            const tabbedElements = containerRef.current?.querySelectorAll("input, button, select, textarea, a[href]");
            const elementsArray = Array.from(tabbedElements?.values() ?? []) as HTMLElement[];
            let currIndex = elementsArray.indexOf(e.target as HTMLElement);
            if (currIndex >= 0) {
              currIndex += 1;
              if (currIndex >= elementsArray.length) currIndex = 0;
              elementsArray[currIndex]?.focus();
            }
          }
          break;
        default:
          {
            const ref = mapping.get(e.key.toLowerCase());
            if (ref) {
              e.preventDefault();
              e.stopPropagation();
              ref.current?.focus();
              ref.current?.click();
            }
          }
          break;
      }
    },
    [mapping],
  );
  return (
    <QuickNavigationContext.Provider value={mapping}>
      <div ref={containerRef} onKeyDownCapture={onKeyDown} role="button" tabIndex={0}>
        {children}
      </div>
    </QuickNavigationContext.Provider>
  );
}
