import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./frdy.css";
import { applyPolyfill } from "custom-elements-hmr-polyfill";

// custom-elements-hmr-polyfill
applyPolyfill();

// addEventListener("set-context-variable", (e) => console.error(e));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
