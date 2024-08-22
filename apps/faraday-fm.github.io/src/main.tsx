import { FaradayHost, FrdyApp } from "@frdy/web-ui";
import { applyPolyfill } from "custom-elements-hmr-polyfill";
import "./frdy.css";
import "./index.css";
// import { buildFaradayFs } from "./services/fs";
import { wsfs } from "./services/wsfs";

// custom-elements-hmr-polyfill
applyPolyfill();

// const faradayFs = await buildFaradayFs();

const host: FaradayHost = {
  config: {
    isDesktop: () => false,
  },
  // rootFs: faradayFs,
  rootFs: wsfs,
};

const app = new FrdyApp();
app.host = host;

const root = document.getElementById('root');
root?.appendChild(app);


// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
