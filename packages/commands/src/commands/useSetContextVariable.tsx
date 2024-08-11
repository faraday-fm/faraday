import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useId, useMemo } from "react";
import { usePrevValueIfDeepEqual } from "../utils/usePrevValueIfDeepEqual";
import { type Node, parser } from "../utils/whenClauseParser";
import { type ContextVariables, useContextVariables } from "../contextVariables";

export function useSetContextVariable<T>(variable: string, value: T, isActive = true): void {
  const id = useContext(ContextVariablesIdContext);
  const { setVariable, deleteVariable } = useContextVariables();
  value = usePrevValueIfDeepEqual(value);

  useEffect(() => {
    let vars: Record<string, unknown>;
    if (!isActive) {
      deleteVariable(id, variable);
      vars = { [variable]: undefined };
    } else {
      setVariable(id, variable, value);
    }
  }, [id, variable, value, isActive, setVariable, deleteVariable]);

  useEffect(() => {
    return () => {
      deleteVariable(id, variable);
    };
  }, [id, deleteVariable, variable]);
}

function getContextValue(ctx: ContextVariables, variable: string) {
  let r: unknown;
  for (const v of Object.values(ctx)) {
    const val = v[variable];
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

function visitNode(ctx: ContextVariables, node: Node, stack: unknown[]) {
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

function evaluate(ctx: ContextVariables, node: Node) {
  const stack: [] = [];
  visitNode(ctx, node, stack);
  return !!stack.pop();
}

export function useIsInContext() {
  const { variables } = useContextVariables();
  return useCallback(
    (expression: string) => {
      const ast = parser.parse(expression);
      if (ast.status) {
        return evaluate(variables, ast.value);
      }
      return false;
    },
    [variables],
  );
}

export function useIsInContextQuery(expression: string) {
  const ast = useMemo(() => {
    const result = parser.parse(expression);
    if (!result.status) {
      console.error("Cannot parse expression", expression);
    }
    return result;
  }, [expression]);
  const { variables } = useContextVariables();
  if (ast.status) {
    return evaluate(variables, ast.value);
  }
  return false;
}

export const ContextVariablesIdContext = createContext<string>("<root>");

export function ContextVariablesProvider({ children }: PropsWithChildren) {
  const parent = useContext(ContextVariablesIdContext);
  const id = useId();
  return <ContextVariablesIdContext.Provider value={`${parent}/${id}`}>{children}</ContextVariablesIdContext.Provider>;
}
