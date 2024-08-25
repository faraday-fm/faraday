import { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import { RegisterCommandEvent, UnregisterCommandEvent } from "./events";
import { CommandOptions } from "./types";

type Method = (...args: any) => any;

export function command(options?: CommandOptions) {
  return (originalMethod: Method, context: ClassMethodDecoratorContext<ReactiveElement>) => {
    const methodName = String(context.name);
    context.addInitializer(function () {
      new CommandRegistration(this, originalMethod.bind(this), { name: methodName, whenFocusWithin: false, makeHostInert: false, ...options });
    });
  };
}

class CommandRegistration<HostElement extends ReactiveControllerHost & HTMLElement> implements ReactiveController {
  #host: HostElement;
  #callback: Method;
  #options: Required<CommandOptions>;

  constructor(host: HostElement, callback: Method, options: Required<CommandOptions>) {
    this.#host = host;
    this.#callback = callback;
    this.#options = options;
    host.addController(this);
  }

  hostConnected(): void {
    this.#host.dispatchEvent(new RegisterCommandEvent(this.#host, this.#callback, this.#options));
  }

  hostDisconnected(): void {
    this.#host.dispatchEvent(new UnregisterCommandEvent(this.#callback));
  }
}
