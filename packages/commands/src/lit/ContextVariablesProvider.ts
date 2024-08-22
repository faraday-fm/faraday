import { ContextProvider, createContext } from "@lit/context";
import type { ReactiveController } from "lit";
import { SetContextVariableEventName, UnsetContextVariableEventName } from "../consts";
import { isDescendant } from "../utils/isDescendant";
import { parser, type Expression } from "../utils/whenClauseParser";
import { SetContextVariableEvent, UnsetContextVariableEvent } from "./events";
import { ContextOptions, HostElement } from "./types";

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
    const ast = parser.parse(when);
    if (ast.status) {
      return evaluate(this.#focusedNode, this.#variables.value, ast.value);
    }
    return false;
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

function visitNode(focusedNode: Node, ctx: ContextVariables, node: Expression, stack: unknown[]) {
  switch (node._) {
    case "c":
      stack.push(node.val);
      break;
    case "v":
      stack.push(getContextValue(focusedNode, ctx, node.val));
      break;
    case "!":
      visitNode(focusedNode, ctx, node.node, stack);
      stack.push(!stack.pop());
      break;
    case "==":
    case "!=":
    case "&&":
    case "||":
      {
        visitNode(focusedNode, ctx, node.left, stack);
        visitNode(focusedNode, ctx, node.right, stack);
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

function evaluate(focusedNode: Node, ctx: ContextVariables, expression: Expression) {
  const stack: [] = [];
  visitNode(focusedNode, ctx, expression, stack);
  return !!stack.pop();
}
