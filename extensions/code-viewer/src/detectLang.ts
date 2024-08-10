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

export function detectLang(path: string) {
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
