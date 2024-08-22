// import { memo } from "react";
// import type { ExtensionManifest } from "../../schemas/manifest";
// import { IconThemeContribution } from "./IconThemeContribution";
// import { CustomPanelContribution } from "./CustomPanelContribution";
// import { getExtId, getCustomPanelId } from "./utils";

// export const ExtensionContributions = memo(({ path, manifest }: { path: string; manifest: ExtensionManifest }) => {
//   const customPanels =
//     manifest.contributes?.customPanels?.map((qv) => (
//       <CustomPanelContribution key={getCustomPanelId(manifest, qv)} path={path} manifest={manifest} customPanel={qv} />
//     )) ?? [];

//   const iconThemes =
//     manifest.contributes?.iconThemes?.map((it) => (
//       <IconThemeContribution key={`${getExtId(manifest)}.${it.id}`} path={path} manifest={manifest} iconTheme={it} />
//     )) ?? [];
//   return (
//     <>
//       {customPanels}
//       {iconThemes}
//     </>
//   );
// });
