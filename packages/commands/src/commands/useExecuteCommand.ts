import { useCallback, useContext } from "react";
import { CommandBindingsContext } from "./commandBindingsContext";

export function useExecuteCommand() {
  const bindings = useContext(CommandBindingsContext);
  const executor = useCallback(
    (command: string, args?: unknown) => {
      const callbacks = bindings[command];
      if (!callbacks || callbacks.size !== 1) {
        return false;
      }
      const [callback] = callbacks;
      const result = callback!.current(args);
      if (typeof result === "undefined") {
        return true;
      }
      return result;
    },
    [bindings],
  );

  return executor;
}
