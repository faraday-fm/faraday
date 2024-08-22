import { ContextProvider, createContext } from "@lit/context";
import jsep, { CoreExpression } from "jsep";
import type { ReactiveController } from "lit";
import { SetContextVariableEventName, UnsetContextVariableEventName } from "../consts";
import { isDescendant } from "../utils/isDescendant";
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
  #focusedNode: Node;

  constructor(host: HostElement) {
    this.#variables = new ContextProvider(host, { context: variablesContext, initialValue: new Map() });
    this.#host = host;
    this.#host.addController?.(this);
    this.#focusedNode = document.getRootNode();
  }

  hostConnected() {
    const addEventListener = this.#host.addEventListener;
    addEventListener(SetContextVariableEventName, this.#onSetContextVariable);
    addEventListener(UnsetContextVariableEventName, this.#onUnsetContextVariable);
    addEventListener("focusin", this.#onFocusIn, true);
  }

  hostDisconnected() {
    const removeEventListener = this.#host.removeEventListener;
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

  #onFocusIn = (e: FocusEvent) => {
    this.#focusedNode = e.target as Element;
  };

  isInContext(when: string) {
    const ast = jsep(when);
    try {
      return evaluate(this.#focusedNode, this.#variables.value, ast as CoreExpression);
    } catch {
      return false;
    }
  }

  // dump() {
  //   console.info(this.#focusedNode);
  //   this.#variables.value.forEach((v, k) =>
  //     console.info(
  //       k,
  //       Array.from(v)
  //         .filter(([k]) => isDescendant(this.#focusedNode, k))
  //         .map(([k, v]) => v.value)
  //     )
  //   );
  //   // console.info(this.#variables.value)
  // }
}

function getContextValue(focusedNode: Node, ctx: ContextVariables, variable: string) {
  let r: unknown;
  const varEntries = ctx.get(variable);
  if (!varEntries) {
    return undefined;
  }
  for (const [el, val] of varEntries) {
    if (val.value === undefined) continue;
    if (val.options.whenFocusWithin && !isDescendant(focusedNode, el)) continue;
    if (r === undefined) {
      r = val.value;
    } else if (!Object.is(r, val.value)) {
      return undefined;
    }
  }
  return r;
}

function visitNode(focusedNode: Node, ctx: ContextVariables, node: CoreExpression, stack: unknown[]) {
  switch (node.type) {
    case "Literal":
      stack.push(node.value);
      break;
    case "Identifier":
      stack.push(getContextValue(focusedNode, ctx, node.name));
      break;
    case "UnaryExpression": {
      visitNode(focusedNode, ctx, node.argument as CoreExpression, stack);
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
        visitNode(focusedNode, ctx, node.left as CoreExpression, stack);
        visitNode(focusedNode, ctx, node.right as CoreExpression, stack);
        const right = stack.pop();
        const left = stack.pop();
        const op = node.operator;
        const push = stack.push;
        if (op === "==") push(left === right);
        else if (op === "!=") push(left !== right);
        else if (op === "||") push(!!left || !!right);
        else if (op === "&&") push(!!left && !!right);
        else if (op === "+") push((left as any) + right);
        else if (op === "-") push(Number(left) - Number(right));
        else if (op === "*") push(Number(left) * Number(right));
        else if (op === "/") push(Number(left) / Number(right));
      }
      break;
  }
}

function evaluate(focusedNode: Node, ctx: ContextVariables, expression: CoreExpression) {
  const stack: [] = [];
  visitNode(focusedNode, ctx, expression, stack);
  return !!stack.pop();
}
