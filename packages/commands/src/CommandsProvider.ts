import { KeyBindingsSchema } from "./schema";
import { CommandsRegistry } from "./CommandsRegistry";
import { ContextVariablesProvider } from "./ContextVariablesProvider";
import { KeyBindingsController } from "./KeyBindingsController";
import { HostElement } from "./types";
import { createContext } from "@lit/context";
import { ContextProvider } from "@lit/context";

export type CommandsContext = {
  invokeCommand(name: string, args: any, path?: EventTarget[]): Promise<any>;
};

export const commandsContext = createContext<CommandsContext>(Symbol("commands"));

export class CommandsProvider {
  #host: HostElement;
  #commandsRegistry: CommandsRegistry;
  #contextVariablesProvider: ContextVariablesProvider;
  #keyBindingsController: KeyBindingsController;
  #commandsContext: ContextProvider<typeof commandsContext>;

  constructor(host: HostElement, bindings?: KeyBindingsSchema) {
    this.#host = host;
    this.#commandsRegistry = new CommandsRegistry(host);
    this.#contextVariablesProvider = new ContextVariablesProvider(host);
    this.#keyBindingsController = new KeyBindingsController(host, this.#commandsRegistry, this.#contextVariablesProvider);
    if (bindings) {
      this.#keyBindingsController.bindings = bindings;
    }
    this.#commandsContext = new ContextProvider(host, { context: commandsContext, initialValue: { invokeCommand: this.#commandsRegistry.invokeCommand } });
  }
}
