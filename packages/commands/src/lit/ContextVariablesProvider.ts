import { ContextProvider, createContext } from "@lit/context";
import jsep, { CoreExpression } from "jsep";
import type { ReactiveController } from "lit";
import { SetContextVariableEventName, UnsetContextVariableEventName } from "../consts";
import { SetContextVariableEvent, UnsetContextVariableEvent } from "./events";
import { ContextOptions, HostElement } from "./types";

jsep.addIdentifierChar(".");
jsep.addIdentifierChar(":");
jsep.removeUnaryOp("~");
const removeBinaryOp = jsep.removeBinaryOp;
removeBinaryOp("|");
removeBinaryOp("^");
removeBinaryOp("&");
removeBinaryOp("===");
removeBinaryOp("!==");
removeBinaryOp("<<");
removeBinaryOp(">>");
removeBinaryOp(">>>");

type ContextVariables = Map<string, Map<HTMLElement, { options: ContextOptions; value: unknown }>>;

const variablesContext = createContext<ContextVariables>(Symbol("variables"));

export class ContextVariablesProvider implements ReactiveController {
  readonly #host: HostElement;
  #variables: ContextProvider<typeof variablesContext>;

  constructor(host: HostElement) {
    this.#variables = new ContextProvider(host, { context: variablesContext, initialValue: new Map() });
    this.#host = host;
    this.#host.addController?.(this);
  }

  hostConnected() {
    const addEventListener = this.#host.addEventListener.bind(this.#host);
    addEventListener(SetContextVariableEventName, this.#onSetContextVariable);
    addEventListener(UnsetContextVariableEventName, this.#onUnsetContextVariable);
  }

  hostDisconnected() {
    const removeEventListener = this.#host.removeEventListener.bind(this.#host);
    removeEventListener(SetContextVariableEventName, this.#onSetContextVariable);
    removeEventListener(UnsetContextVariableEventName, this.#onUnsetContextVariable);
  }

  #onSetContextVariable = (e: SetContextVariableEvent) => {
    e.stopPropagation();
    const { host, options, value } = e;
    let vars = this.#variables.value.get(options.name);
    if (!vars) {
      vars = new Map();
      this.#variables.value.set(options.name, vars);
    }
    vars.set(host, { options, value });
    this.#variables.updateObservers();
  };

  #onUnsetContextVariable = (e: UnsetContextVariableEvent) => {
    e.stopPropagation();
    const { host, name } = e;
    let vars = this.#variables.value.get(name);
    if (vars != null) {
      vars.delete(host);
    }
    this.#variables.updateObservers();
  };

  isInContext(when: string, path?: EventTarget[]) {
    const ast = jsep(when);
    try {
      return this.#evaluate(ast as CoreExpression, path);
    } catch {
      return false;
    }
  }

  dump() {
    this.#variables.value.forEach((v, k) =>
      console.info(
        k,
        Array.from(v).map(([k, v]) => v.value)
      )
    );
  }

  #getContextValue = (variable: string, path?: EventTarget[]) => {
    let r: unknown;
    const varEntries = this.#variables.value.get(variable);
    if (!varEntries) {
      return undefined;
    }
    for (const [el, val] of varEntries) {
      if (val.value === undefined) continue;
      if (val.options.whenFocusWithin && (!path || !path.includes(el))) continue;
      if (r === undefined) {
        r = val.value;
      } else if (!Object.is(r, val.value)) {
        return undefined;
      }
    }
    return r;
  };

  #visitNode = (node: CoreExpression, stack: unknown[], path?: EventTarget[]) => {
    switch (node.type) {
      case "Literal":
        stack.push(node.value);
        break;
      case "Identifier":
        stack.push(this.#getContextValue(node.name, path));
        break;
      case "UnaryExpression": {
        this.#visitNode(node.argument as CoreExpression, stack, path);
        const val = stack.pop();
        switch (node.operator) {
          case "!":
            stack.push(!val);
            break;
          case "-":
            stack.push(-Number(val));
            break;
          case "+":
            stack.push(Number(val));
            break;
        }
        break;
      }
      case "BinaryExpression":
        {
          this.#visitNode(node.left as CoreExpression, stack, path);
          this.#visitNode(node.right as CoreExpression, stack, path);
          const right = stack.pop();
          const left = stack.pop();
          const op = node.operator;
          if (op === "==") stack.push(left === right);
          else if (op === "!=") stack.push(left !== right);
          else if (op === "||") stack.push(!!left || !!right);
          else if (op === "&&") stack.push(!!left && !!right);
          else if (op === "+") stack.push((left as any) + right);
          else if (op === "-") stack.push(Number(left) - Number(right));
          else if (op === "*") stack.push(Number(left) * Number(right));
          else if (op === "/") stack.push(Number(left) / Number(right));
        }
        break;
      default:
        console.error("Unknown expression:", node);
    }
  };

  #evaluate = (expression: CoreExpression, path?: EventTarget[]) => {
    const stack: [] = [];
    this.#visitNode(expression, stack, path);
    return !!stack.pop();
  };
}
