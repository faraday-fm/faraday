import type { ReactiveController, ReactiveControllerHost } from "@lit/reactive-element";

import { SetContextVariableEvent, UnsetContextVariableEvent } from "./decorators/events";

type ReactiveElementHost = Partial<ReactiveControllerHost> & HTMLElement;

export class ContextVariablesProviderLit<HostElement extends ReactiveElementHost = ReactiveElementHost> implements ReactiveController {
  protected readonly host: HostElement;
  private _variables = new Map<string, Map<HTMLElement, any[]>>();

  constructor(host: HostElement) {
    this.host = host;
    this.attachListeners();
    this.host.addController?.(this);
  }

  hostConnected() {}

  private attachListeners = () => {
    this.host.addEventListener("set-context-variable", this.onSetContextVariable);
    this.host.addEventListener("unset-context-variable", this.onUnsetContextVariable);
  }

  // hostConnected(): void {
  //   // emit an event to signal a provider is available for this context
  //   // this.host.dispatchEvent(new ContextProviderEvent(this.context));
  // }

  private onSetContextVariable = (e: SetContextVariableEvent) => {
    let vars = this._variables.get(e.name);
    if (vars == null) {
      vars = new Map();
      this._variables.set(e.name, vars);
    }
    vars.set(e.host, e.value);
    e.stopPropagation();
  };

  private onUnsetContextVariable = (e: UnsetContextVariableEvent) => {
    let vars = this._variables.get(e.name);
    if (vars != null) {
      vars.delete(e.host);
    }
    e.stopPropagation();
  };
}
