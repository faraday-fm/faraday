import { javascript } from "@codemirror/lang-javascript";
import { language } from "@codemirror/language";
import { Compartment } from "@codemirror/state";
import { AceMask, type FileType, Flags, readFile } from "@frdy/sdk";
import { EditorView, basicSetup } from "codemirror";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "preact/compat";
import { cobalt } from "thememirror";
import { defaultThemeOption } from "./defaultThemeOption";
import { detectLang } from "./detectLang";

export type AppRef = {
  activate(): void;
  deactivate(): void;
};

const languageConf = new Compartment();

export const App = forwardRef<AppRef>((_, ref) => {
  const [activefile, setActivefile] = useState("");
  const viewParentRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView>();

  useEffect(() => {
    if (viewParentRef.current) {
      const view = new EditorView({
        extensions: [
          basicSetup,
          defaultThemeOption,
          cobalt,
          languageConf.of(javascript()),
          EditorView.lineWrapping,
          // EditorState.readOnly.of(true)
        ],
        parent: viewParentRef.current,
      });
      setView(view);
    }
  }, []);

  const load = useCallback(
    (path: string) => {
      setActivefile(path);
      const loadAsync = async () => {
        if (!view) return;
        const newLangExt = detectLang(path);
        const currLang = view.state.facet(language);
        const arr = await readFile(faraday.fs, path);
        const text = new TextDecoder().decode(arr);
        const transaction = view.state.update({
          changes: { from: 0, to: view.state.doc.length, insert: text },
          effects: newLangExt.language !== currLang ? languageConf.reconfigure(newLangExt) : undefined,
        });
        view?.dispatch(transaction);
        viewParentRef.current!.style.visibility = "visible";
      };

      loadAsync();
    },
    [view],
  );

  useEffect(() => {
    faraday.events.on("activefilechange", load);
    if (faraday.activefile) {
      load(faraday.activefile);
    }
  }, [load]);

  useImperativeHandle(ref, () => ({
    activate: () => {
      faraday.events.on("activefilechange", load);
      if (faraday.activefile) {
        load(faraday.activefile);
      }
    },
    deactivate: () => {
      faraday.events.off("activefilechange", load);
      if (view) {
        view.dispatch(view.state.update({ changes: { from: 0, to: view.state.doc.length, insert: "" } }));
      }
      viewParentRef.current!.style.visibility = "collapse";
    },
  }));

  return (
    <div style={{ display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
      <div ref={viewParentRef} style={{ display: "grid", overflow: "hidden" }} />
      <div>
        <button
          type="button"
          onClick={async () => {
            const handle = await faraday.fs.open(activefile, AceMask.WRITE_DATA, Flags.CREATE_TRUNCATE, { type: 0 as FileType });
            await faraday.fs.write(handle, 0, new TextEncoder().encode(view?.state.doc.toString() ?? ""));
            await faraday.fs.close(handle);
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
});
