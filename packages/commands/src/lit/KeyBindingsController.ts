import type { ReactiveController, ReactiveControllerHost } from "lit";
import { KeyBindingsSchema } from "../schema";
import { InvokeCommandEvent } from "./decorators/events";

const getModifiers = (e: KeyboardEvent) => {
  return [e.ctrlKey ? "Ctrl" : "", e.altKey ? "Alt" : "", e.shiftKey ? "Shift" : "", e.metaKey ? "Meta" : ""].filter((m) => m).join("+");
};

export class KeyBindingsController<HostElement extends Partial<ReactiveControllerHost> & HTMLElement> implements ReactiveController {
  bindings: KeyBindingsSchema;
  #host: HostElement;

  constructor(host: HostElement, bindings?: KeyBindingsSchema) {
    this.#host = host;
    this.bindings = bindings ?? [];
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
    if (!bindings) {
      return;
    }
    const modifiers = getModifiers(e);
    const keyCombination = modifiers ? `${modifiers}+${e.code}` : e.code;
    console.debug("Key pressed:", e.key, "(", keyCombination, ")");
    for (let i = bindings.length - 1; i >= 0; i -= 1) {
      const binding = bindings[i]!;
      if (binding.key === keyCombination /* && (!binding.when || isInContext(binding.when))*/) {
        if (binding.args != null) {
          console.debug(binding.command, "(", JSON.stringify(binding.args), ")");
        } else {
          console.debug(binding.command, "()");
        }
        this.#host.dispatchEvent(new InvokeCommandEvent(binding.command));
        e.stopPropagation();
        e.preventDefault();
        break;
      }
    }
  };
}
