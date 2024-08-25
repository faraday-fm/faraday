import { ReactiveControllerHost } from "lit";

export type HostElement = ReactiveControllerHost & HTMLElement;

export type CommandOptions = {
  name?: string;
  whenFocusWithin?: boolean;
  makeHostInert?: boolean;
};

export type ContextOptions = {
  name: string;
  whenFocusWithin?: boolean;
};
