import { Faraday, type FaradayHost } from "@frdy/web-ui";
// import { buildFaradayFs } from "./services/fs";
import { wsfs } from "./services/wsfs";

// const faradayFs = await buildFaradayFs();

const host: FaradayHost = {
  config: {
    isDesktop: () => false,
  },
  rootFs: wsfs,
};

function App() {
  return (
    <div
      style={{ width: "100%", height: "100%", display: "grid" }}
    >
      <Faraday host={host} />
    </div>
  );
}

export default App;
