import { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import { RegisterCommandEvent, UnregisterCommandEvent } from "./events";
import { CommandOptions } from "./types";
import { isDescendant } from "../utils/isDescendant";

export function command(options?: CommandOptions) {
  return (originalMethod: any, context: ClassMethodDecoratorContext<ReactiveElement>) => {
    const methodName = String(context.name);
    context.addInitializer(function () {
      new CommandRegistration(this, originalMethod.bind(this), { name: methodName, when: "", whenFocusWithin: false, ...options });
    });
  };
}

class CommandRegistration<HostElement extends ReactiveControllerHost & HTMLElement> implements ReactiveController {
  #isInsideFocus = false;
  #host: HostElement;
  #callback: () => void;
  #options: Required<CommandOptions>;

  constructor(host: HostElement, callback: () => void, options: Required<CommandOptions>) {
    this.#host = host;
    this.#callback = callback;
    this.#options = options;
    host.addController(this);
  }

  hostConnected(): void {
    this.#isInsideFocus = document.hasFocus() && isDescendant(this.#host, document.activeElement!);
    if (this.#options.whenFocusWithin) {
      this.#host.addEventListener("focus", this.#onFocus, { capture: true });
      this.#host.addEventListener("focusin", this.#onFocusIn, true);
      this.#host.addEventListener("focusout", this.#onFocusOut, true);
    }
    if (!this.#options.whenFocusWithin || this.#isInsideFocus) {
      this.#host.dispatchEvent(new RegisterCommandEvent(this.#callback, this.#options));
    }
  }

  hostDisconnected(): void {
    this.#host.dispatchEvent(new UnregisterCommandEvent(this.#callback));
  }

  #onFocus = () => {
    if (!this.#isInsideFocus) {
      this.#isInsideFocus = true;
      this.#host.dispatchEvent(new RegisterCommandEvent(this.#callback, this.#options));
    }
  };

  #onFocusIn = () => {
    // if (document.hasFocus() && !this.#isInsideFocus) {
    //   this.#isInsideFocus = true;
    //   this.#host.dispatchEvent(new RegisterCommandEvent(this.#callback, this.#options));
    // }
  };

  #onFocusOut = () => {
    setTimeout(() => {
      if (!document.hasFocus() || !isDescendant(this.#host, document.activeElement!)) {
        this.#isInsideFocus = false;
        this.#host.dispatchEvent(new UnregisterCommandEvent(this.#callback));
      }
    });
  };
}

// export class X extends LitElement {
//   @command()
//   dfg(d: string) {
//     return 7;
//   }
// }
