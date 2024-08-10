import { Compartment, EditorState } from "@codemirror/state";
import { AceMask, FileType, Flags, readFile } from "@frdy/sdk";
import { basicSetup, EditorView } from "codemirror";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "preact/compat";
import { defaultThemeOption } from "./defaultThemeOption";
import { cobalt } from "thememirror";
import { javascript } from "@codemirror/lang-javascript";
import { detectLang } from "./detectLang";
import { language } from "@codemirror/language";

export type AppRef = {
  activate(): void;
  deactivate(): void;
  setData(data: string): void;
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
        const arr = await readFile(path);
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
    setData: (data) => {},
  }));

  return (
    <div style={{ display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
      <div ref={viewParentRef} style={{ display: "grid", overflow: "hidden" }} />
      <div>
        <button
          type="button"
          onClick={async () => {
            const handle = await faraday.fs.open(activefile, AceMask.WRITE_DATA, Flags.CREATE_TRUNCATE, { type: FileType.REGULAR });
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
