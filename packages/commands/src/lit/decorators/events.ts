import { CommandOptions } from "./types";

export class RegisterCommandEvent extends Event {
  constructor(public readonly callback: () => void, public readonly options: Required<CommandOptions>) {
    super("register-command", { bubbles: true, composed: true });
  }
}

export class InvokeCommandEvent extends Event {
  constructor(public readonly name: string) {
    super("invoke-command", { bubbles: true, composed: true });
  }
}

export class UnregisterCommandEvent extends Event {
  constructor(public readonly callback: () => void) {
    super("unregister-command", { bubbles: true, composed: true });
  }
}

export class SetContextVariableEvent extends Event {
  constructor(public readonly host: HTMLElement, public readonly name: string, public value: any) {
    super("set-context-variable", { bubbles: true, composed: true });
  }
}

export class UnsetContextVariableEvent extends Event {
  constructor(public readonly host: HTMLElement, public readonly name: string) {
    super("unset-context-variable", { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    "invoke-command": InvokeCommandEvent;
    "register-command": RegisterCommandEvent;
    "unregister-command": UnregisterCommandEvent;
    "set-context-variable": SetContextVariableEvent;
    "unset-context-variable": UnsetContextVariableEvent;
  }
}
