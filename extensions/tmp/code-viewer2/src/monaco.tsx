import * as monaco from "monaco-editor";
import { useEffect, useRef } from "preact/compat";
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
// @ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker: (workerId, label) => {
    // const getWorkerModule: (workerId: string, label: string) => Worker = (moduleUrl, label) => {
    //   return new Worker(self.MonacoEnvironment!.getWorkerUrl!(moduleUrl, ""), {
    //     name: label,
    //     type: "module",
    //   });
    // };
		// jsonWorker

    switch (label) {
      case "json":
        return jsonWorker();
      case "css":
      case "scss":
      case "less":
        return cssWorker();
      case "html":
      case "handlebars":
      case "razor":
        return htmlWorker();
      case "typescript":
      case "javascript":
        return tsWorker();
      default:
        return editorWorker();
    }
  },
};

export function Monaco() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) {
      monaco.editor.create(rootRef.current, {
        value: "function hello() {\n\talert('Hello world!');\n}",
        language: "javascript",
      });
    }
  }, []);

  return <div ref={rootRef} />;
}
