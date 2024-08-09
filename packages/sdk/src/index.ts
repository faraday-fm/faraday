import type { FileSystemProvider } from './fs';
export * from './fs';

export type Theme = {
  fontFamily: string;
  colors: Record<string, string>;
};

type EventsMap = {
  themechange: (theme: Theme) => void;
  activefilechange: (filepath: string) => void;
}

export interface FaradayEvents {
  on<E extends keyof EventsMap>(event: E, callback: EventsMap[E]): void;
  off<E extends keyof EventsMap>(event: E, callback: EventsMap[E]): void;
}

declare global {
  const faraday: {
    theme: Theme;
    events: FaradayEvents;
    fs: FileSystemProvider;
  };
}
