// import { type PropsWithChildren, createContext, useEffect } from "react";
// import { parse } from "valibot";
// import keyBindingsContent from "../assets/keybindings.json";
// import { useExecuteCommand, useIsInContext } from "../commands";
// import { KeyBindingsSchema } from "../schema";
// import type { KeyBinding } from "./types";
// import { useKeyModifiers } from "./useKeyModifiers";

// /**
//  * Parsed key bindings from the provided JSON file.
//  */
// const keyBindings = parse(KeyBindingsSchema, keyBindingsContent);

// /**
//  * Context to provide key bindings to the component tree.
//  */
// export const KeyBindingContext = createContext<KeyBinding[]>([]);

// /**
//  * Provides key bindings to child components and handles keydown events to execute commands
//  * when matching key combinations are detected.
//  *
//  * @param {PropsWithChildren} props - The properties object with children components.
//  * @returns {JSX.Element} - The KeyBindingContext.Provider with the provided key bindings.
//  */
// export function KeyBindingProvider({ children }: PropsWithChildren): JSX.Element {
//   const isInContext = useIsInContext();
//   const executeCommand = useExecuteCommand();
//   const { getModifiers } = useKeyModifiers();

//   const bindings = keyBindings;

//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       const modifiers = getModifiers(e);
//       const keyCombination = modifiers ? `${modifiers}+${e.code}` : e.code;
//       console.debug("Key pressed:", e.key, "(", keyCombination, ")");
//       for (let i = bindings.length - 1; i >= 0; i -= 1) {
//         const binding = bindings[i]!;
//         if (binding.key === keyCombination && (!binding.when || isInContext(binding.when))) {
//           if (binding.args != null) {
//             console.debug(binding.command, "(", JSON.stringify(binding.args), ")");
//           } else {
//             console.debug(binding.command, "()");
//           }
//           void executeCommand(binding.command, binding.args);
//           e.stopPropagation();
//           e.preventDefault();
//           break;
//         }
//       }
//     };
//     window.addEventListener("keydown", onKeyDown, { capture: true });
//     return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
//   }, [bindings, getModifiers, executeCommand, isInContext]);

//   return <KeyBindingContext.Provider value={bindings}>{children}</KeyBindingContext.Provider>;
// }
