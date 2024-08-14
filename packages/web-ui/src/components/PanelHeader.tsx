import { css } from "@css";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

const panelHeader =css`color: var(--panel-header-foreground);
    background-color: var(--panel-header-background);
    overflow: hidden;

    &.-active {
      color: var(--panel-header-foreground-focus);
      background-color: var(--panel-header-background-focus);
    }`;

export const PanelHeader = ({ active, children }: PropsWithChildren<{ active: boolean }>) => {
  return <div className={clsx(panelHeader, active && "-active")}>{children}</div>;
};
