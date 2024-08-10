import { EditorView } from "codemirror";

export const defaultThemeOption = EditorView.theme({
  "&": {
    backgroundColor: faraday.theme.colors["panel.background"],
    color: faraday.theme.colors["panel.foreground"],
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  "& .cm-activeLine": {
    backgroundColor: `color-mix(in srgb, transparent, ${faraday.theme.colors["panel.foreground"]} 5%)`,
  },
  "& .cm-selectionLayer .cm-selectionBackground": {
    backgroundColor: `color-mix(in srgb, ${faraday.theme.colors["panel.background"]}, ${faraday.theme.colors["panel.foreground"]} 10%)`,
  },
  "&.cm-focused .cm-selectionLayer .cm-selectionBackground": {
    backgroundColor: `color-mix(in srgb, ${faraday.theme.colors["panel.background"]}, ${faraday.theme.colors["panel.foreground"]} 10%)`,
  },
  "& .cm-gutters": {
    backgroundColor: `color-mix(in srgb, ${faraday.theme.colors["panel.background"]}, ${faraday.theme.colors["panel.foreground"]} 5%)`,
    color: faraday.theme.colors["panel.foreground"],
  },
  "& .cm-gutters .cm-activeLineGutter": {
    backgroundColor: `color-mix(in srgb, ${faraday.theme.colors["panel.background"]}, ${faraday.theme.colors["panel.foreground"]} 10%)`,
  },
  "& .cm-scroller": {
    height: "100% !important",
  },
});
