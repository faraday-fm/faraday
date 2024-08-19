import { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import { SetContextVariableEvent, UnsetContextVariableEvent } from "./events";
import { ContextOptions } from "./types";

export function context<T = any>(options?: ContextOptions) {
  return function (target: ClassAccessorDecoratorTarget<ReactiveElement, T>, context: ClassAccessorDecoratorContext<ReactiveElement, T>) {
    const propertyName = String(context.name);
    let controller: ContextVariablesController<ReactiveElement> | undefined;
    context.addInitializer(function () {
      controller = new ContextVariablesController(this, target.get, { name: propertyName, whenFocus: false, whenFocusWithin: false, ...options });
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
  private isInsideFocus = false;

  constructor(private host: HostElement, private get: () => any, private options: Required<ContextOptions>) {
    this.host.addController(this);
  }

  hostConnected(): void {
    this.isInsideFocus = document.hasFocus() && isFocusWithin(this.host, document.activeElement);
    if (this.options.whenFocusWithin) {
      this.host.addEventListener("focusin", this.onFocusIn, true);
      this.host.addEventListener("focusout", this.onFocusOut, true);
    }
    if (!this.options.whenFocusWithin || this.isInsideFocus) {
      this.host.dispatchEvent(new SetContextVariableEvent(this.host, this.options.name, this.get.call(this.host)));
    }
  }

  hostDisconnected(): void {
    if (this.options.whenFocusWithin) {
      this.host.removeEventListener("focusin", this.onFocusIn);
      this.host.removeEventListener("focusout", this.onFocusOut);
    }
    this.host.dispatchEvent(new UnsetContextVariableEvent(this.host, this.options.name));
  }

  updateValue(value: any) {
    if (this.isInsideFocus) {
      this.host.dispatchEvent(new SetContextVariableEvent(this.host, this.options.name, value));
    }
  }

  private onFocusIn = (event: FocusEvent) => {
    if (document.hasFocus() && !this.isInsideFocus) {
      this.isInsideFocus = true;
      this.host.dispatchEvent(new SetContextVariableEvent(this.host, this.options.name, this.get.call(this.host)));
    }
  };
  private onFocusOut = (e: any) => {
    setTimeout(() => {
      if (!document.hasFocus() || !isFocusWithin(this.host, document.activeElement)) {
        this.isInsideFocus = false;
        this.host.dispatchEvent(new UnsetContextVariableEvent(this.host, this.options.name));
      }
    });
  };
}

function isFocusWithin(host: Element, child: Element | null) {
  let el = child;
  while (el && el !== host) {
    el = el.parentElement;
  }
  return el === host;
}

// class X extends ReactiveElement {
//   @context()
//   accessor sdf = 5;
// }
