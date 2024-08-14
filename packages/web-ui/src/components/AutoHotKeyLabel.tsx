import { type PropsWithChildren, type ReactElement, useRef } from "react";
import { useQuickNavigation } from "../contexts/quickNavigationContext";
import { Highlight } from "./Highlight";
import { css } from "@css";

const autoHotkeyLabel = css`cursor: pointer;
    user-select: none;
    -webkit-user-select: none;

    & em {
      font-style: normal;
      color: var(--textAcceleratorKey-foreground);
      text-decoration: underline;
    }`;

type AutoHotKeyLabelProps = {
  text: string;
  htmlFor?: string;
} & PropsWithChildren<unknown>;

export function AutoHotKeyLabel({ text, htmlFor }: AutoHotKeyLabelProps): ReactElement {
  const ref = useRef<HTMLLabelElement>(null);
  const key = useQuickNavigation(ref, text);

  return (
    <label className={autoHotkeyLabel} ref={ref} htmlFor={htmlFor}>
      <Highlight text={text} highlight={key} />
    </label>
  );
}
