import { Faraday, FaradayHost } from "@frdy/web-ui";
import { ipcfs } from "./services/ipcfs";

const host: FaradayHost = {
  config: {
    isDesktop: () => false,
  },
  rootFs: ipcfs,
};

function App(): React.JSX.Element {
  return (
    <div style={{width: '100%', height: '100%'}}>
      <Faraday host={host} />
    </div>
  );
}

export default App;
