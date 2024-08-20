import { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import { isFocusWithin } from "../utils/isFocusWithin";
import { SetContextVariableEvent, UnsetContextVariableEvent } from "./events";
import { ContextOptions } from "./types";

export function context<T = any>(options?: ContextOptions) {
  return (target: ClassAccessorDecoratorTarget<ReactiveElement, T>, context: ClassAccessorDecoratorContext<ReactiveElement, T>) => {
    const propertyName = String(context.name);
    let controller: ContextVariablesController<ReactiveElement> | undefined;
    context.addInitializer(function () {
      controller = new ContextVariablesController(this, target.get, { name: propertyName, whenFocusWithin: false, ...options });
    });
    let v: any;
    return {
      get() {
        return v;
      },
      set(value) {
        if (!Object.is(v, value)) {
          v = value;
          controller?.updateValue(value);
        }
      },
      init(value) {
        v = value;
        controller?.updateValue(value);
        return value;
      },
    } satisfies ClassAccessorDecoratorResult<ReactiveElement, T>;
  };
}

class ContextVariablesController<HostElement extends ReactiveControllerHost & HTMLElement> implements ReactiveController {
  #isInsideFocus = false;
  #host: HostElement;
  #get: () => any;
  #options: Required<ContextOptions>;

  constructor(host: HostElement, get: () => any, options: Required<ContextOptions>) {
    this.#host = host;
    this.#get = get;
    this.#options = options;
    this.#host.addController(this);
  }

  hostConnected(): void {
    this.#isInsideFocus = document.hasFocus() && isFocusWithin(this.#host, document.activeElement);
    if (this.#options.whenFocusWithin) {
      this.#host.addEventListener("focusin", this.#onFocusIn, true);
      this.#host.addEventListener("focusout", this.#onFocusOut, true);
    }
    if (!this.#options.whenFocusWithin || this.#isInsideFocus) {
      this.#host.dispatchEvent(new SetContextVariableEvent(this.#host, this.#options.name, this.#get.call(this.#host)));
    }
  }

  hostDisconnected(): void {
    if (this.#options.whenFocusWithin) {
      this.#host.removeEventListener("focusin", this.#onFocusIn);
      this.#host.removeEventListener("focusout", this.#onFocusOut);
    }
    this.#host.dispatchEvent(new UnsetContextVariableEvent(this.#host, this.#options.name));
  }

  updateValue(value: any) {
    if (this.#isInsideFocus) {
      this.#host.dispatchEvent(new SetContextVariableEvent(this.#host, this.#options.name, value));
    }
  }

  #onFocusIn = () => {
    if (document.hasFocus() && !this.#isInsideFocus) {
      this.#isInsideFocus = true;
      this.#host.dispatchEvent(new SetContextVariableEvent(this.#host, this.#options.name, this.#get.call(this.#host)));
    }
  };

  #onFocusOut = () => {
    setTimeout(() => {
      if (!document.hasFocus() || !isFocusWithin(this.#host, document.activeElement)) {
        this.#isInsideFocus = false;
        this.#host.dispatchEvent(new UnsetContextVariableEvent(this.#host, this.#options.name));
      }
    });
  };
}

// class X extends ReactiveElement {
//   @context()
//   accessor sdf = 5;
// }
