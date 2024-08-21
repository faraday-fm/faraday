import { ReactiveControllerHost } from "lit";

export type HostElement = ReactiveControllerHost & HTMLElement;

export type CommandOptions = {
  name?: string;
  when?: string;
  whenFocusWithin?: boolean;
};

export type ContextOptions = {
  name: string;
  whenFocusWithin?: boolean;
};
