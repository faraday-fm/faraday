import type { ReactiveController, ReactiveControllerHost } from "lit";
import { InvokeCommandEvent, RegisterCommandEvent, UnregisterCommandEvent } from "./decorators/events";
import { InvokeCommandEventName, RegisterCommandEventName, UnregisterCommandEventName } from "../consts";

export class CommandRegistry<HostElement extends ReactiveControllerHost & HTMLElement> implements ReactiveController {
  #host: HostElement;
  #commands = new Map<string, Set<any>>();
  #commandNames = new Map<any, string>();

  constructor(host: HostElement) {
    this.#host = host;
    host.addController(this);
  }

  hostConnected() {
    this.#host.addEventListener(RegisterCommandEventName, this.#onRegisterCommand);
    this.#host.addEventListener(UnregisterCommandEventName, this.#onUnregisterCommand);
    this.#host.addEventListener(InvokeCommandEventName, this.#onInvokeCommand);
  }

  hostDisconnected() {
    this.#host.removeEventListener(RegisterCommandEventName, this.#onRegisterCommand);
    this.#host.removeEventListener(UnregisterCommandEventName, this.#onUnregisterCommand);
    this.#host.removeEventListener(InvokeCommandEventName, this.#onInvokeCommand);
  }

  #onRegisterCommand = (e: RegisterCommandEvent) => {
    let handlers = this.#commands.get(e.options.name);
    if (!handlers) {
      handlers = new Set();
      this.#commands.set(e.options.name, handlers);
    }
    handlers.add(e.callback);
    this.#commandNames.set(e.callback, e.options.name);
  };

  #onUnregisterCommand = (e: UnregisterCommandEvent) => {
    let commandName = this.#commandNames.get(e.callback);
    if (commandName) {
      const handlers = this.#commands.get(commandName);
      if (handlers) {
        handlers.delete(e.callback);
        if (handlers.size === 0) {
          this.#commands.delete(commandName);
        }
      }
      this.#commandNames.delete(e.callback);
    }
  };

  #onInvokeCommand = (e: InvokeCommandEvent) => {
    const handlers = this.#commands.get(e.name);
    if (handlers && handlers.size === 1) {
      const [handler] = handlers;
      handler();
    }
  };
}
