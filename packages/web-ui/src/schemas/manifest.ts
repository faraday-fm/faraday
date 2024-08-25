import { type InferOutput, array, enum as enum_, object, optional, string } from "valibot";

const CustomPanelDefinition = object({
  id: string(),
  extensions: optional(array(string())),
  filenames: optional(array(string())),
  mimetypes: optional(array(string())),
  path: string(),
});

const IconThemeDefinition = object({
  id: string(),
  label: string(),
  path: string(),
});

const ThemeDefinition = object({
  label: string(),
  uiTheme: enum_({
    vs: "vs",
    "vs-dark": "vs-dark",
    "hc-light": "hc-light",
    "hc-black": "hc-black",
    // fd: "fd",
    // "fd-light": "fd-light",
    // hc: "hc",
    // "hc-light": "hc-light",
  }),
  path: string(),
});

const LanguageDefinition = object({
  id: string(),
  aliases: optional(array(string())),
  extensions: optional(array(string())),
  filenames: optional(array(string())),
  filenamePatterns: optional(array(string())),
  configuration: optional(string()),
});

const Contributes = object({
  customPanels: optional(array(CustomPanelDefinition)),
  iconThemes: optional(array(IconThemeDefinition)),
  themes: optional(array(ThemeDefinition)),
  languages: optional(array(LanguageDefinition)),
});

export const ExtensionManifest = object({
  name: string(),
  version: string(),
  displayName: string(),
  description: string(),
  publisher: string(),
  main: optional(string()),
  browser: optional(string()),
  contributes: optional(Contributes),
});

export type CustomPanelDefinition = InferOutput<typeof CustomPanelDefinition>;

export type ThemeDefinition = InferOutput<typeof ThemeDefinition>;

export type IconThemeDefinition = InferOutput<typeof IconThemeDefinition>;

export type LanguageDefinition = InferOutput<typeof LanguageDefinition>;

export type Contributes = InferOutput<typeof Contributes>;

export type ExtensionManifest = InferOutput<typeof ExtensionManifest>;
