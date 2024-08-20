import { KeyBindingsSchema } from "../schema";
import { CommandsRegistry } from "./CommandsRegistry";
import { ContextVariablesProvider } from "./ContextVariablesProvider";
import { KeyBindingsController } from "./KeyBindingsController";
import { HostElement } from "./types";

export class CommandsProvider {
  #host: HostElement;
  #commandsRegistry: CommandsRegistry;
  #contextVariablesProvider: ContextVariablesProvider;
  #keyBindingsController: KeyBindingsController;

  constructor(host: HostElement, bindings?: KeyBindingsSchema) {
    this.#host = host;
    this.#commandsRegistry = new CommandsRegistry(host);
    this.#contextVariablesProvider = new ContextVariablesProvider(host);
    this.#keyBindingsController = new KeyBindingsController(host, this.#commandsRegistry, this.#contextVariablesProvider);
    if (bindings) {
      this.#keyBindingsController.bindings = bindings;
    }
  }
}
