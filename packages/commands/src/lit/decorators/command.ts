import { LitElement, ReactiveController, ReactiveControllerHost, ReactiveElement } from "lit";
import { RegisterCommandEvent, UnregisterCommandEvent } from "./events";
import { CommandOptions } from "./types";

export function command(options?: CommandOptions) {
  return function (originalMethod: any, context: ClassMethodDecoratorContext<ReactiveElement>) {
    const methodName = String(context.name);
    context.addInitializer(function () {
      new CommandRegistration(this, originalMethod.bind(this), { name: methodName, when: "", whenFocus: false, whenFocusWithin: false, ...options });
    });
  };
}

class CommandRegistration<HostElement extends ReactiveControllerHost & HTMLElement> implements ReactiveController {
  constructor(private host: HostElement, private callback: () => void, private options: Required<CommandOptions>) {
    host.addController(this);
  }

  hostConnected(): void {
    this.host.dispatchEvent(new RegisterCommandEvent(this.callback, this.options));
  }

  hostDisconnected(): void {
    this.host.dispatchEvent(new UnregisterCommandEvent(this.callback));
  }
}

// export class X extends LitElement {
//   @command()
//   dfg(d: string) {
//     return 7;
//   }
// }
