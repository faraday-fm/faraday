import { type PropsWithChildren, useRef } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import { GlyphSizeContext } from "./GlyphSizeContext";

export function GlyphSizeProvider({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useElementSize(ref as React.RefObject<HTMLDivElement>, { width: 8, height: 16 });

  return (
    <GlyphSizeContext.Provider value={size}>
      <div
        aria-hidden
        ref={ref}
        style={{
          position: "absolute",
          opacity: 0,
          userSelect: "none",
          pointerEvents: "none",
          left: -1000,
          top: -1000,
        }}
      >
        W
      </div>
      {children}
    </GlyphSizeContext.Provider>
  );
}
