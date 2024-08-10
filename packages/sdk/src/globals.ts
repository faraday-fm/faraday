import type { FaradayEvents } from "./events";
import type { Theme } from "./theme";
import type { FileSystemProvider } from "./fs";

declare global {
  const faraday: {
    activefile?: string;
    theme: Theme;
    events: FaradayEvents;
    fs: FileSystemProvider;
  };
}
