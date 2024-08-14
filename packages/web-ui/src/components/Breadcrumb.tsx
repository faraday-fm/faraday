import type { PropsWithChildren } from "react";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { css } from "@css";
import clsx from "clsx";

const breadcrumb = css`--background: linear-gradient(to right, transparent, var(--panel-header-background));
    display: flex;
    flex-direction: row;
    overflow: hidden;

    &:hover> :not(:hover):last-child {
      /* flex-shrink: 1; */
    }

    &.-active {
      --background: linear-gradient(to right, transparent, var(--panel-header-background-focus));
    }`;

function BreadcrumbRoot({ isActive, children }: PropsWithChildren & { isActive: boolean }) {
  return <nav className={clsx(breadcrumb, isActive && "-active")}>{children}</nav>;
}

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Item: BreadcrumbItem,
});
