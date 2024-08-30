import { FaradayHost, FrdyApp } from "@frdy/web-ui";
import { wsfs } from "./services/wsfs";
// import { buildFaradayFs } from "./services/fs";
import { useEffect, useRef } from "react";
import { term } from "./services/term";

// const faradayFs = await buildFaradayFs();

const host: FaradayHost = {
  config: {
    isDesktop: () => false,
  },
  terminal: term,
  // rootFs: faradayFs,
  rootFs: wsfs,
};

const app = new FrdyApp();
app.host = host;

const root = document.getElementById("root");
root?.appendChild(app);

function App() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.append(app);
    }
  });

  return (
    <div ref={rootRef} style={{ width: "100%", height: "100%", display: "grid" }}>
      {/* <Faraday host={host} /> */}
    </div>
  );
}

export default App;
