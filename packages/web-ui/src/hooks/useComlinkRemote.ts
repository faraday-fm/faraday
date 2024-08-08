import * as Comlink from "comlink";
import { useEffect, useRef } from "react";

export function useComlinkRemote<T>(w: Window | MessagePort | null | undefined) {
  const remoteRef = useRef<T>();
  useEffect(() => {
    if (!w) {
      return undefined;
    }
    const ep = w instanceof MessagePort ? w : Comlink.windowEndpoint(w);
    remoteRef.current = Comlink.wrap<T>(ep) as T;
  }, [w]);
  return remoteRef;
}
