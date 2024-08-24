import type { ReactiveController } from "lit";
import { RegisterCommandEventName, UnregisterCommandEventName } from "../consts";
import { RegisterCommandEvent, UnregisterCommandEvent } from "./events";
import { CommandOptions, HostElement } from "./types";

export class CommandsRegistry implements ReactiveController {
  #host: HostElement;
  #commands = new Map<string, Map<(args: any) => any, { host: HTMLElement; options: CommandOptions }>>();
  #commandNames = new Map<any, string>();
  #subscribed = false;

  constructor(host: HostElement) {
    this.#host = host;
    host.addController(this);
    this.#subscribe();
  }

  #subscribe() {
    if (!this.#subscribed) {
      this.#host.addEventListener(RegisterCommandEventName, this.#onRegisterCommand);
      this.#host.addEventListener(UnregisterCommandEventName, this.#onUnregisterCommand);
      this.#subscribed = true;
    }
  }

  #unsubscribe() {
    if (this.#subscribed) {
      this.#host.removeEventListener(RegisterCommandEventName, this.#onRegisterCommand);
      this.#host.removeEventListener(UnregisterCommandEventName, this.#onUnregisterCommand);
      this.#subscribed = false;
    }
  }

  hostConnected = this.#subscribe;
  hostDisconnected = this.#unsubscribe;

  #onRegisterCommand = (e: RegisterCommandEvent) => {
    const { name } = e.options;
    let handlers = this.#commands.get(name);
    if (!handlers) {
      handlers = new Map();
      this.#commands.set(name, handlers);
    }
    handlers.set(e.callback, { host: e.host, options: e.options });
    this.#commandNames.set(e.callback, name);
  };

  #onUnregisterCommand = (e: UnregisterCommandEvent) => {
    const { callback } = e;
    let commandName = this.#commandNames.get(callback);
    if (commandName) {
      const handlers = this.#commands.get(commandName);
      if (handlers) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.#commands.delete(commandName);
        }
      }
      this.#commandNames.delete(callback);
    }
  };

  invokeCommand = async (name: string, args: any, path?: EventTarget[]) => {
    const handlers = this.#commands.get(name);
    if (handlers) {
      for (const [handler, h] of handlers) {
        if (h.options.whenFocusWithin != null) {
          const isFocusWithin = path && path.includes(h.host);
          if (h.options.whenFocusWithin !== isFocusWithin) continue;
        }
        await handler(args);
      }
    }
    // if (handlers && handlers.size === 1) {
    //   const [handler] = handlers;
    //   handler(args);
    // }
  };
}
