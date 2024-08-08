import * as Comlink from "comlink";
import { useEffect, useMemo, useRef } from "react";

export function useComlinkRemote<T>(w: Window | null | undefined) {
  const remoteRef = useRef<T>();
  useEffect(() => {
    if (!w) {
      return undefined;
    }
    remoteRef.current = Comlink.wrap<T>(Comlink.windowEndpoint(w, self, "*")) as T;
  }, [w]);
  return remoteRef;
}
