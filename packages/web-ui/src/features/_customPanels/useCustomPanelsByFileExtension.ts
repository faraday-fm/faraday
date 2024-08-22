// import { useMemo } from "react";
// import type { FileExtension, FullyQualifiedCustomPanel } from "../extensions/types";
// import { useCustomPanels } from "./useCustomPanels";

// export function useCustomPanelsByFileExtension() {
//   const { customPanels } = useCustomPanels();
//   return useMemo(() => {
//     const result: Record<FileExtension, FullyQualifiedCustomPanel[]> = {};
//     const customPanelsByExtension = Object.entries(customPanels);
//     customPanelsByExtension.forEach(([extId, cp]) => {
//       if (!cp.definition || !cp.isActive) {
//         return;
//       }
//       const customPanel = cp.definition;
//       if (cp.definition.extensions) {
//         cp.definition.extensions.forEach((ext) => {
//           (result[ext] ??= []).push({
//             extId,
//             customPanel,
//             extensionPath: cp.extensionPath,
//           });
//         });
//       }
//     });
//     return result;
//   }, [customPanels]);
// }
