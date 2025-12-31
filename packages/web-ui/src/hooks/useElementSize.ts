import { type RefObject, useLayoutEffect, useState } from "react";
import { useResizeObserver } from "usehooks-ts";

interface ElementSize {
  width: number;
  height: number;
}

export function useElementSize<T extends HTMLElement>(ref: RefObject<T | null>, defaultSize?: ElementSize) {
  const [size, setSize] = useState(defaultSize ?? { width: 8, height: 16 });

  useLayoutEffect(() => {
    if (ref.current) {
      setSize(ref.current.getBoundingClientRect());
    }
  }, [ref]);

  useResizeObserver({
    ref: ref as RefObject<T>,
    onResize: (size) => setSize(size as DOMRect),
  });

  return size;
}
