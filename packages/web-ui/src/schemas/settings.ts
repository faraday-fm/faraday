import { boolean, type InferOutput, object, optional, string } from "valibot";

export const Settings = object({
  themeId: optional(string()),
  iconThemeId: optional(string()),
  lang: optional(string()),
  showHiddenFiles: optional(boolean()),
});

export type Settings = InferOutput<typeof Settings>;
