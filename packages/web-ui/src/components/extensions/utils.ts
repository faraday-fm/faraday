import type { ExtensionManifest, IconThemeDefinition, CustomPanelDefinition } from "../../schemas/manifest";

export function getExtId(manifest: ExtensionManifest) {
  return `${manifest.publisher}.${manifest.name}`;
}

export function getCustomPanelId(manifest: ExtensionManifest, customPanel: CustomPanelDefinition) {
  return `${getExtId(manifest)}.${customPanel.id}`;
}

export function getIconThemeId(manifest: ExtensionManifest, theme: IconThemeDefinition) {
  return `${getExtId(manifest)}.${theme.id}`;
}
