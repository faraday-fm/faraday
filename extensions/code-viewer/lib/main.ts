import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { language } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { readFile } from "@frdy/sdk";
import { EditorView, basicSetup } from "codemirror";
import { cobalt } from "thememirror";

const languageConf = new Compartment();

function detectLang(path: string) {
  const dotIdx = path.lastIndexOf(".");
  if (dotIdx >= 0) {
    const ext = path.substring(dotIdx + 1).toLowerCase();
    switch (ext) {
      case "json":
        return json();
      case "md":
        return markdown();
      case "html":
        return html();
      case "js":
      case "json5":
      case "mjs":
        return javascript();
    }
  }
  return json();
}

const root = document.getElementById("root")!;

const view: EditorView = new EditorView({
  extensions: [basicSetup, cobalt, languageConf.of(javascript()), EditorState.readOnly.of(true)],
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
