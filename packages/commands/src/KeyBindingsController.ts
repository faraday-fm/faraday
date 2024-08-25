import type { ReactiveController } from "lit";
import { KeyBindingsSchema } from "./schema";
import { CommandsRegistry } from "./CommandsRegistry";
import { HostElement } from "./types";
import { ContextVariablesProvider } from "./ContextVariablesProvider";

const getModifiers = (e: KeyboardEvent) => {
  return [e.ctrlKey ? "Ctrl" : "", e.altKey ? "Alt" : "", e.shiftKey ? "Shift" : "", e.metaKey ? "Meta" : ""].filter((m) => m).join("+");
};

export class KeyBindingsController implements ReactiveController {
  bindings: KeyBindingsSchema = [];
  #host: HostElement;
  #commands: CommandsRegistry;
  #vars: ContextVariablesProvider;
  #executionPromise = Promise.resolve();

  constructor(host: HostElement, commands: CommandsRegistry, vars: ContextVariablesProvider) {
    this.#host = host;
    this.#commands = commands;
    this.#vars = vars;
    host.addController?.(this);
  }

  hostConnected() {
    this.#host.addEventListener("keydown", this.#onKeyDown, { capture: true });
  }

  hostDisconnected() {
    this.#host.removeEventListener("keydown", this.#onKeyDown, { capture: true });
  }

  #onKeyDown = (e: KeyboardEvent) => {
    const bindings = this.bindings;
    const modifiers = getModifiers(e);
    const keyCombination = modifiers ? `${modifiers}+${e.code}` : e.code;
    console.debug("Key pressed:", e.key, "(", keyCombination, ")");
    const path = e.composedPath();

    let matchedBinding: KeyBindingsSchema[number] | undefined;
    for (let i = bindings.length - 1; i >= 0; i -= 1) {
      const binding = bindings[i]!;
      const { key, command, args, when } = binding;

      if (key === keyCombination && (!when || this.#vars.isInContext(when, path))) {
        if (args != null) {
          console.debug(command, "(", JSON.stringify(args), ")");
        } else {
          console.debug(command, "()");
        }
        matchedBinding = binding;
        break;
      }
    }

    if (matchedBinding) {
      e.stopPropagation();
      e.preventDefault();
      this.#executionPromise = this.#executionPromise.then(() => this.#commands.invokeCommand(matchedBinding.command, matchedBinding.args, path));
    }
  };
}
