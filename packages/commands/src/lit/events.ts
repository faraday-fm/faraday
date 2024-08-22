import { RegisterCommandEventName, SetContextVariableEventName, UnregisterCommandEventName, UnsetContextVariableEventName } from "../consts";
import { CommandOptions, ContextOptions } from "./types";

export class RegisterCommandEvent extends Event {
  constructor(public readonly host: HTMLElement, public readonly callback: () => void, public readonly options: Required<CommandOptions>) {
    super(RegisterCommandEventName, { bubbles: true, composed: true });
  }
}

export class UnregisterCommandEvent extends Event {
  constructor(public readonly callback: () => void) {
    super(UnregisterCommandEventName, { bubbles: true, composed: true });
  }
}

export class SetContextVariableEvent extends Event {
  constructor(public readonly host: HTMLElement, public readonly options: ContextOptions, public value: any) {
    super(SetContextVariableEventName, { bubbles: true, composed: true });
  }
}

export class UnsetContextVariableEvent extends Event {
  constructor(public readonly host: HTMLElement, public readonly name: string) {
    super(UnsetContextVariableEventName, { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    [RegisterCommandEventName]: RegisterCommandEvent;
    [UnregisterCommandEventName]: UnregisterCommandEvent;
    [SetContextVariableEventName]: SetContextVariableEvent;
    [UnsetContextVariableEventName]: UnsetContextVariableEvent;
  }
}
