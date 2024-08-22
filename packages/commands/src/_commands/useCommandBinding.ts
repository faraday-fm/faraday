// import { useContext, useEffect, useRef } from "react";
// import { type Callback, CommandBindingsContext } from "./commandBindingsContext";

// export function useCommandBinding(command: string, callback: Callback, isActive = true) {
//   const bindings = useContext(CommandBindingsContext);
//   const callbackRef = useRef(callback);
//   callbackRef.current = callback;

//   useEffect(() => {
//     if (!isActive) return;
//     let callbacks = bindings[command];
//     if (!callbacks) {
//       callbacks = new Set();
//       bindings[command] = callbacks;
//     }
//     callbacks.add(callbackRef);
//     return () => {
//       callbacks?.delete(callbackRef);
//       if (callbacks?.size === 0) {
//         delete bindings[command];
//       }
//     };
//   }, [command, isActive, bindings]);
// }
