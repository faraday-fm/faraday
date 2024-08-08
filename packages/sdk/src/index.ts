import type { FileSystemProvider } from './fs';
export * from './fs';

export type Theme = {
  fontFamily: string;
  colors: Record<string, string>;
};

export interface FaradayEvents {
  on(event: "themechange", callback: (theme: Theme) => void): void;
  off(event: "themechange", callback: (theme: Theme) => void): void;
}

declare global {
  const faraday: {
    theme: Theme;
    events: FaradayEvents;
    fs: FileSystemProvider;
  };
}
