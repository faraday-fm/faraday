import type { ReactiveController } from "lit";
import { RegisterCommandEventName, UnregisterCommandEventName } from "../consts";
import { RegisterCommandEvent, UnregisterCommandEvent } from "./events";
import { HostElement } from "./types";

export class CommandsRegistry implements ReactiveController {
  #host: HostElement;
  #commands = new Map<string, Set<any>>();
  #commandNames = new Map<any, string>();
  #subscribed = false;

  constructor(host: HostElement) {
    this.#host = host;
    host.addController(this);
    this.#subscribe();
  }

  #subscribe() {
    if (!this.#subscribed) {
      const addEventListener = this.#host.addEventListener;
      addEventListener(RegisterCommandEventName, this.#onRegisterCommand);
      addEventListener(UnregisterCommandEventName, this.#onUnregisterCommand);
      this.#subscribed = true;
    }
  }

  #unsubscribe() {
    if (this.#subscribed) {
      const removeEventListener = this.#host.removeEventListener;
      removeEventListener(RegisterCommandEventName, this.#onRegisterCommand);
      removeEventListener(UnregisterCommandEventName, this.#onUnregisterCommand);
      this.#subscribed = false;
    }
  }

  hostConnected = this.#subscribe;
  hostDisconnected = this.#unsubscribe;

  #onRegisterCommand = (e: RegisterCommandEvent) => {
    const { name } = e.options;
    let handlers = this.#commands.get(name);
    if (!handlers) {
      handlers = new Set();
      this.#commands.set(name, handlers);
    }
    handlers.add(e.callback);
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

  invokeCommand = (name: string, args: any) => {
    const handlers = this.#commands.get(name);
    if (handlers) {
      handlers.forEach((handler) => {
        handler(args);
      });
    }
    // if (handlers && handlers.size === 1) {
    //   const [handler] = handlers;
    //   handler(args);
    // }
  };
}
