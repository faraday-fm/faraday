import * as Comlink from "comlink";
import { useMemo } from "react";

export function useComlinkExpose<T>(w: Window | MessagePort | null | undefined, obj: T) {
  return useMemo(() => {
    if (!w) {
      return false;
    }
    const ep = w instanceof MessagePort ? w : Comlink.windowEndpoint(w);
    Comlink.expose(obj, ep);
    return true;
  }, [w, obj]);
}
