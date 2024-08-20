import type { ReactiveController } from "lit";
import { SetContextVariableEventName, UnsetContextVariableEventName } from "../consts";
import { parser, type Expression } from "../utils/whenClauseParser";
import { SetContextVariableEvent, UnsetContextVariableEvent } from "./events";
import { HostElement } from './types';

type ContextVariables = Map<string, Map<HTMLElement, unknown>>;

export class ContextVariablesProvider implements ReactiveController {
  readonly #host: HostElement;
  #variables: ContextVariables = new Map();

  constructor(host: HostElement) {
    this.#host = host;
    this.#host.addController?.(this);
  }

  hostConnected() {
    const addEventListener = this.#host.addEventListener;
    addEventListener(SetContextVariableEventName, this.#onSetContextVariable);
    addEventListener(UnsetContextVariableEventName, this.#onUnsetContextVariable);
  }

  hostDisconnected() {
    const removeEventListener = this.#host.removeEventListener;
    removeEventListener(SetContextVariableEventName, this.#onSetContextVariable);
    removeEventListener(UnsetContextVariableEventName, this.#onUnsetContextVariable);
  }

  #onSetContextVariable = (e: SetContextVariableEvent) => {
    e.stopPropagation();
    const { host, name, value } = e;
    let vars = this.#variables.get(name);
    if (vars == null) {
      vars = new Map();
      this.#variables.set(name, vars);
    }
    vars.set(host, value);
  };

  #onUnsetContextVariable = (e: UnsetContextVariableEvent) => {
    e.stopPropagation();
    const { host, name } = e;
    let vars = this.#variables.get(name);
    if (vars != null) {
      vars.delete(host);
    }
  };

  isInContext(when: string) {
    const ast = parser.parse(when);
    if (ast.status) {
      return evaluate(this.#variables, ast.value);
    }
    return false;
  }
}

function getContextValue(ctx: ContextVariables, variable: string) {
  let r: unknown;
  const varEntries = ctx.get(variable);
  if (!varEntries) {
    return undefined;
  }
  for (const val of varEntries.values()) {
    if (val !== undefined) {
      if (r === undefined) {
        r = val;
      } else if (r !== val) {
        return undefined;
      }
    }
  }
  return r;
}

function visitNode(ctx: ContextVariables, node: Expression, stack: unknown[]) {
  switch (node._) {
    case "c":
      stack.push(node.val);
      break;
    case "v":
      stack.push(getContextValue(ctx, node.val));
      break;
    case "!":
      visitNode(ctx, node.node, stack);
      stack.push(!stack.pop());
      break;
    case "==":
    case "!=":
    case "&&":
    case "||":
      {
        visitNode(ctx, node.left, stack);
        visitNode(ctx, node.right, stack);
        const right = stack.pop();
        const left = stack.pop();
        if (node._ === "==") stack.push(left === right);
        else if (node._ === "!=") stack.push(left !== right);
        else if (node._ === "||") stack.push(!!left || !!right);
        else if (node._ === "&&") stack.push(!!left && !!right);
      }
      break;
  }
}

function evaluate(ctx: ContextVariables, expression: Expression) {
  const stack: [] = [];
  visitNode(ctx, expression, stack);
  return !!stack.pop();
}
