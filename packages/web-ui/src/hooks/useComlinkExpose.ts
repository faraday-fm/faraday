import * as Comlink from "comlink";
import { useMemo } from "react";

export function useComlinkExpose<T>(w: Window | null | undefined, obj: T) {
  return useMemo(() => {
    if (!w) {
      return undefined;
    }
    const ep = Comlink.windowEndpoint(w, self, "*");
    return Comlink.expose(obj, ep);
  }, [w, obj]);
}
