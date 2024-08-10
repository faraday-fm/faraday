import type { Theme } from "./theme";

type EventsMap = {
  themechange: (theme: Theme) => void;
  activefilechange: (filepath: string) => void;
};

export interface FaradayEvents {
  on<E extends keyof EventsMap>(event: E, callback: EventsMap[E]): void;
  off<E extends keyof EventsMap>(event: E, callback: EventsMap[E]): void;
}
