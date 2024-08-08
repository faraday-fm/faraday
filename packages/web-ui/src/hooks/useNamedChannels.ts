import { useCallback, useRef } from "react";

export function useNamedChannels() {
  const channelRefs = useRef(new Map<string, MessageChannel>());
  return useCallback((name: string) => {
    let ch = channelRefs.current.get(name);
    if (!ch) {
      ch = new MessageChannel();
      channelRefs.current.set(name, ch);
    }
    return ch;
  }, []);
}
