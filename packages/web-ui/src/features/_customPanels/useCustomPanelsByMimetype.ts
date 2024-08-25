// import { useMemo } from "react";
// import type { FullyQualifiedCustomPanel, Mimetype } from "../extensions/types";
// import { useCustomPanels } from "./useCustomPanels";

// export function useCustomPanelsByMimetype() {
//   const { customPanels } = useCustomPanels();
//   return useMemo(() => {
//     const result: Record<Mimetype, FullyQualifiedCustomPanel[]> = {};
//     const customPanelsByExtension = Object.entries(customPanels);
//     customPanelsByExtension.forEach(([extId, cp]) => {
//       if (!cp.definition || !cp.isActive) {
//         return;
//       }
//       const customPanel = cp.definition;
//       if (cp.definition.mimetypes) {
//         cp.definition.mimetypes.forEach((type) => {
//           (result[type] ??= []).push({
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
