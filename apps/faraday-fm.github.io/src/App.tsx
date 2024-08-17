import { Faraday, type FaradayHost } from "@frdy/web-ui";
import { wsfs } from "./services/wsfs";
import { buildFaradayFs } from "./services/fs";

const faradayFs = await buildFaradayFs();

const host: FaradayHost = {
  config: {
    isDesktop: () => false,
  },
  rootFs: faradayFs,
  // rootFs: wsfs,
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
