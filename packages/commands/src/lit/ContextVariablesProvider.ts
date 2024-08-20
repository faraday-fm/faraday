import type { ReactiveController, ReactiveControllerHost } from "lit";
import { SetContextVariableEvent, UnsetContextVariableEvent } from "./decorators/events";
import { SetContextVariableEventName, UnsetContextVariableEventName } from "../consts";

type ReactiveElementHost = Partial<ReactiveControllerHost> & HTMLElement;

export class ContextVariablesProvider<HostElement extends ReactiveElementHost = ReactiveElementHost> implements ReactiveController {
  readonly #host: HostElement;
  #variables = new Map<string, Map<HTMLElement, any[]>>();

  constructor(host: HostElement) {
    this.#host = host;
    this.#attachListeners();
    this.#host.addController?.(this);
  }

  hostConnected() {}

  #attachListeners = () => {
    this.#host.addEventListener(SetContextVariableEventName, this.#onSetContextVariable);
    this.#host.addEventListener(UnsetContextVariableEventName, this.#onUnsetContextVariable);
  };

  // hostConnected(): void {
  //   // emit an event to signal a provider is available for this context
  //   // this.host.dispatchEvent(new ContextProviderEvent(this.context));
  // }

  #onSetContextVariable = (e: SetContextVariableEvent) => {
    let vars = this.#variables.get(e.name);
    if (vars == null) {
      vars = new Map();
      this.#variables.set(e.name, vars);
    }
    vars.set(e.host, e.value);
    e.stopPropagation();
  };

  #onUnsetContextVariable = (e: UnsetContextVariableEvent) => {
    let vars = this.#variables.get(e.name);
    if (vars != null) {
      vars.delete(e.host);
    }
    e.stopPropagation();
  };
}
