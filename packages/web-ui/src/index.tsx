import { App } from "./components/App";
import { FaradayHostProvider } from "./contexts/faradayHostContext";
import { AppStoreProvider } from "./features/store";
import type { FaradayProps } from "./types";

export type { FaradayConfig, FaradayHost, FaradayProps, Terminal, TerminalSession } from "./types";

export function Faraday({ host }: FaradayProps) {
  // const dark = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <AppStoreProvider>
      <FaradayHostProvider host={host}>
        <App />
      </FaradayHostProvider>
    </AppStoreProvider>
  );
}
