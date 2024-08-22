// import { memo, useEffect } from "react";
// import { useCustomPanels } from "../../features/customPanels/hooks";
// import type { ExtensionManifest, CustomPanelDefinition } from "../../schemas/manifest";
// import { getCustomPanelId } from "./utils";

// export const CustomPanelContribution = memo(function CustomPanelContribution({
//   path,
//   manifest,
//   customPanel,
// }: {
//   path: string;
//   manifest: ExtensionManifest;
//   customPanel: CustomPanelDefinition;
// }) {
//   const id = getCustomPanelId(manifest, customPanel);
//   const { activateCustomPanel, deactivateCustomPanel, setCustomPanelDefinition } = useCustomPanels();

//   useEffect(() => {
//     setCustomPanelDefinition(id, path, customPanel);
//   }, [id, customPanel, path, setCustomPanelDefinition]);

//   useEffect(() => {
//     activateCustomPanel(id);

//     return () => {
//       deactivateCustomPanel(id);
//     };
//   }, [activateCustomPanel, deactivateCustomPanel, id]);

//   return null;
// });
