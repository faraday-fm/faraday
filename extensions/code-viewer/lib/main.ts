import { language } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { readFile } from "@frdy/sdk";
import { EditorView, basicSetup } from "codemirror";
import { cobalt } from "thememirror";

import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { markdown } from "@codemirror/lang-markdown";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { angular } from "@codemirror/lang-angular";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { less } from "@codemirror/lang-less";
import { lezer } from "@codemirror/lang-lezer";
import { liquid } from "@codemirror/lang-liquid";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { sass } from "@codemirror/lang-sass";
import { vue } from "@codemirror/lang-vue";
import { wast } from "@codemirror/lang-wast";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";

const languageConf = new Compartment();

function detectLang(path: string) {
  const dotIdx = path.lastIndexOf(".");
  if (dotIdx >= 0) {
    const ext = path.substring(dotIdx + 1).toLowerCase();
    switch (ext) {
      case "component.html":
        return angular();
      case "json":
        return json();
      case "md":
        return markdown();
      case "html":
        return html();
      case "js":
      case "jsonc":
      case "json5":
      case "mjs":
      case "cjs":
        return javascript();
      case "jsx":
        return javascript({ jsx: true });
      case "ts":
      case "mts":
        return javascript({ typescript: true });
      case "tsx":
        return javascript({ typescript: true, jsx: true });
      case "sql":
        return sql();
      case "css":
        return css();
      case "go":
        return go();
      case "cpp":
        return cpp();
      case "java":
        return java();
      case "less":
        return less();
      case "lezer":
        return lezer();
      case "liquid":
        return liquid();
      case "php":
        return php();
      case "rs":
        return rust();
      case "sass":
        return sass();
      case "vue":
        return vue();
      case "wast":
        return wast();
      case "xml":
        return xml();
      case "yml":
      case "yaml":
        return yaml();
    }
  }
  return json();
}

const root = document.getElementById("root")!;

const defaultThemeOption = EditorView.theme({
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
  "& .cm-gutters .cm-activeLineGutter":{
    backgroundColor: `color-mix(in srgb, ${faraday.theme.colors["panel.background"]}, ${faraday.theme.colors["panel.foreground"]} 10%)`,
  },
  "& .cm-scroller": {
    height: "100% !important",
  },
});

const view: EditorView = new EditorView({
  extensions: [basicSetup, defaultThemeOption, cobalt, languageConf.of(javascript()), EditorState.readOnly.of(true)],
  parent: root,
});

const load = async (path: string) => {
  const newLangExt = detectLang(path);
  const currLang = view.state.facet(language);
  const arr = await readFile(path);
  const text = new TextDecoder().decode(arr);
  const transaction = view.state.update({
    changes: { from: 0, to: view.state.doc.length, insert: text },
    effects: newLangExt.language !== currLang ? languageConf.reconfigure(newLangExt) : undefined,
  });
  view.dispatch(transaction);
  root.style.visibility = "visible";
};

export function activate() {
  console.info("Activated");
  faraday.events.on("activefilechange", load);
  if (faraday.activefile) {
    load(faraday.activefile);
  }
}

export function deactivate() {
  console.info("Deactivated");
  root.style.visibility = "hidden";
  faraday.events.off("activefilechange", load);
  view.dispatch(view.state.update({ changes: { from: 0, to: view.state.doc.length, insert: "" } }));
}
