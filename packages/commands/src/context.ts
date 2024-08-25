import { ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import { SetContextVariableEvent, UnsetContextVariableEvent } from "./events";
import { ContextOptions } from "./types";

export function context<T = any>(options?: Partial<ContextOptions>) {
  return (target: ClassAccessorDecoratorTarget<ReactiveElement, T>, context: ClassAccessorDecoratorContext<ReactiveElement, T>) => {
    const propertyName = String(context.name);
    const controllerMap = new WeakMap<ReactiveElement, ContextVariablesController<ReactiveElement>>();
    context.addInitializer(function () {
      controllerMap.set(this, new ContextVariablesController(this, target, { name: propertyName, whenFocusWithin: false, ...options }));
    });
    return {
      get() {
        return target.get.call(this);
      },
      set(value) {
        const currValue = target.get.call(this);
        target.set.call(this, value);
        if (!Object.is(currValue, value)) {
          controllerMap.get(this)?.updateValue(value);
        }
      },
      init(value) {
        controllerMap.get(this)?.updateValue(value);
        return value;
      },
    } satisfies ClassAccessorDecoratorResult<ReactiveElement, T>;
  };
}

class ContextVariablesController<HostElement extends ReactiveControllerHost & ReactiveElement, T = any> implements ReactiveController {
  #host: HostElement;
  #target: ClassAccessorDecoratorTarget<ReactiveElement, T>;
  #options: Required<ContextOptions>;

  constructor(host: HostElement, target: ClassAccessorDecoratorTarget<ReactiveElement, T>, options: Required<ContextOptions>) {
    this.#host = host;
    this.#target = target;
    this.#options = options;
    this.#host.addController(this);
  }

  hostConnected(): void {
    this.#host.dispatchEvent(new SetContextVariableEvent(this.#host, this.#options, this.#target.get.call(this.#host)));
  }

  hostDisconnected(): void {
    this.#host.dispatchEvent(new UnsetContextVariableEvent(this.#host, this.#options.name));
  }

  updateValue(value: any) {
    this.#host.dispatchEvent(new SetContextVariableEvent(this.#host, this.#options, value));
  }
}

// class X extends ReactiveElement {
//   @context()
//   accessor sdf = 5;
// }
