// import { produce } from "immer";
// import { atom, useAtom } from "jotai";
// import { useCallback, useMemo } from "react";

// /**
//  * Type representing a collection of context variables.
//  */
// export type ContextVariables = Record<string, Record<string, unknown>>;

// export interface UseContextVariables {
//   variables: ContextVariables;

//   setVariable: (id: string, variable: string, value: unknown) => void;
//   deleteVariable: (id: string, variable: string) => void;
// }

// /**
//  * Atom to store context variables using Jotai.
//  */
// export const contextVariablesAtom = atom<ContextVariables>({});

// /**
//  * Custom hook to manage context variables.
//  *
//  * @returns {UseContextVariables} The current context variables and functions to set or update them.
//  */
// export function useContextVariables(): UseContextVariables {
//   const [variables, setVariables] = useAtom(contextVariablesAtom);

//   const setVariable = useCallback(
//     (id: string, variable: string, value: unknown) =>
//       setVariables(
//         produce((draft) => {
//           (draft[id] ??= {})[variable] = value;
//         }),
//       ),
//     [setVariables],
//   );

//   const deleteVariable = useCallback(
//     (id: string, variable: string) =>
//       setVariables(
//         produce((draft) => {
//           if (draft[id]) {
//             delete draft[id][variable];
//           }
//         }),
//       ),
//     [setVariables],
//   );

//   return useMemo(
//     () => ({
//       variables,
//       setVariable,
//       deleteVariable,
//     }),
//     [variables, setVariable, deleteVariable],
//   );
// }
