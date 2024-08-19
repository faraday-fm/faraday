import type { ReactiveController, ReactiveControllerHost } from "@lit/reactive-element";
import { InvokeCommandEvent, RegisterCommandEvent, UnregisterCommandEvent } from "./decorators/events";

export class CommandRegistry<HostElement extends ReactiveControllerHost & HTMLElement> implements ReactiveController {
  private _commands = new Map<string, Set<any>>();
  private _commandNames = new Map<any, string>();

  constructor(private readonly host: HostElement) {
    host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener("register-command", this.onRegisterCommand);
    this.host.addEventListener("unregister-command", this.onUnregisterCommand);
    this.host.addEventListener("invoke-command", this.onInvokeCommand);
  }

  hostDisconnected() {
    this.host.removeEventListener("register-command", this.onRegisterCommand);
    this.host.removeEventListener("unregister-command", this.onUnregisterCommand);
    this.host.removeEventListener("invoke-command", this.onInvokeCommand);
  }

  private onRegisterCommand = (e: RegisterCommandEvent) => {
    let handlers = this._commands.get(e.options.name);
    if (!handlers) {
      handlers = new Set();
      this._commands.set(e.options.name, handlers);
    }
    handlers.add(e.callback);
    this._commandNames.set(e.callback, e.options.name);
  };

  private onUnregisterCommand = (e: UnregisterCommandEvent) => {
    let commandName = this._commandNames.get(e.callback);
    if (commandName) {
      const handlers = this._commands.get(commandName);
      if (handlers) {
        handlers.delete(e.callback);
        if (handlers.size === 0) {
          this._commands.delete(commandName);
        }
      }
      this._commandNames.delete(e.callback);
    }
  };

  private onInvokeCommand = (e: InvokeCommandEvent) => {
    const handlers = this._commands.get(e.name);
    if (handlers && handlers.size === 1) {
      const [handler] = handlers;
      handler();
    }
  };
}
