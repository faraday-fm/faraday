import { type InferOutput, object, boolean, optional, record, string, array, union } from "valibot";

const Color = union([string(), array(string())]);

const TokenColor = object({
  scope: union([string(), array(string())]),
  settings: object({
    foreground: optional(string()),
    background: optional(string()),
    fontStyle: optional(string()),
  }),
});

export const ThemeSchema = object({
  name: string(),
  fontFamily: optional(string()),
  colors: optional(record(string(), Color)),
  semanticHighlighting: optional(boolean()),
  tokenColors: optional(array(TokenColor)),
});

export type Theme = InferOutput<typeof ThemeSchema>;
