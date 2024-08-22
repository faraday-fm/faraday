// import { useContext, useMemo } from "react";
// import { ContextVariablesIdContext, useIsInContextQuery } from "./useSetContextVariable";
// import { useContextVariables } from "../contextVariables";

// export function DebugContextVariables() {
//   const id = useContext(ContextVariablesIdContext);
//   const devMode = useIsInContextQuery("devMode");
//   const { variables } = useContextVariables();
//   const vars = variables[id];
//   const entries = useMemo(
//     () =>
//       Object.entries(vars ?? {})
//         .filter(([, v]) => v != null)
//         .toSorted(([k1], [k2]) => k1.localeCompare(k2)),
//     [vars],
//   );
//   return (
//     <>
//       {devMode && entries.length > 0 && (
//         <div className="frdy debug-panel">
//           <table>
//             <tbody>
//               <tr>
//                 <td>Context:</td>
//                 <td>{id}</td>
//               </tr>
//               {entries.map(([key, val]) => (
//                 <tr key={key}>
//                   <td>{key}:</td>
//                   <td>{JSON.stringify(val)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </>
//   );
// }
