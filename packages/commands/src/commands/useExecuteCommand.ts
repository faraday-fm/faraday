// import { useCallback, useContext } from "react";
// import { CommandBindingsContext } from "./commandBindingsContext";

// export function useExecuteCommand() {
//   const bindings = useContext(CommandBindingsContext);
//   const executor = useCallback(
//     (command: string, args?: unknown) => {
//       const callbacks = bindings[command];
//       if (!callbacks) {
//         return false;
//       }
//       if (callbacks.size !== 1) {
//         console.warn(`More than one handler is registered for the command ${command}. Skipping execution.`);
//         return false;
//       }
//       const [callback] = callbacks;
//       const result = callback!.current(args);
//       if (typeof result === "undefined") {
//         return true;
//       }
//       return result;
//     },
//     [bindings],
//   );

//   return executor;
// }
