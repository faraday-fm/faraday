import { useIsInContextQuery } from "@frdy/commands";
import type { PropsWithChildren } from "react";

export function RenderWhen({ expression, children }: PropsWithChildren<{ expression: string }>) {
  const shouldRender = useIsInContextQuery(expression);
  if (shouldRender) {
    return <>{children}</>;
  }
  return null;
}
