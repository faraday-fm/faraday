import type { CustomPanelDefinition } from "../../schemas/manifest";

export type Mimetype = string;
export type FileName = string;
export type FileExtension = string;

export interface FullyQualifiedCustomPanel {
  extId: string;
  extensionPath: string;
  customPanel: CustomPanelDefinition;
}
