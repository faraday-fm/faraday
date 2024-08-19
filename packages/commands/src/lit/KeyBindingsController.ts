import type { ReactiveController, ReactiveControllerHost } from "@lit/reactive-element";
import { KeyBindingsSchema } from "../schema";
import { InvokeCommandEvent } from "./decorators/events";
import keybindings from "../assets/keybindings.json";

const getModifiers = (e: KeyboardEvent) => {
  return [e.ctrlKey ? "Ctrl" : "", e.altKey ? "Alt" : "", e.shiftKey ? "Shift" : "", e.metaKey ? "Meta" : ""].filter((m) => m).join("+");
};

export class KeyBindingsController<HostElement extends Partial<ReactiveControllerHost> & HTMLElement> implements ReactiveController {
  private bindings: KeyBindingsSchema = keybindings;

  constructor(private readonly host: HostElement) {
    host.addController?.(this);
  }

  hostConnected() {
    this.host.addEventListener("keydown", this.onKeyDown, { capture: true });
  }

  hostDisconnected() {
    this.host.removeEventListener("keydown", this.onKeyDown, { capture: true });
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.bindings) {
      return;
    }
    const modifiers = getModifiers(e);
    const keyCombination = modifiers ? `${modifiers}+${e.code}` : e.code;
    console.debug("Key pressed:", e.key, "(", keyCombination, ")");
    for (let i = this.bindings.length - 1; i >= 0; i -= 1) {
      const binding = this.bindings[i]!;
      if (binding.key === keyCombination /* && (!binding.when || isInContext(binding.when))*/) {
        if (binding.args != null) {
          console.debug(binding.command, "(", JSON.stringify(binding.args), ")");
        } else {
          console.debug(binding.command, "()");
        }
        this.host.dispatchEvent(new InvokeCommandEvent(binding.command));
        // executeCommand(binding.command, binding.args);
        e.stopPropagation();
        e.preventDefault();
        break;
      }
    }
  };
}
