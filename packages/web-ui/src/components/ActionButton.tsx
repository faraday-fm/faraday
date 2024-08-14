import { css } from "@css";
import { memo } from "react";

const actionButton = css`display: flex; flex-wrap: nowrap; align-items: stretch; padding-right: 0.5rem; &:last-child { padding-right: 0; }`;
const fnKeyClass = css`color: var(--actionBar-keyForeground); background-color: var(--actionBar-keyBackground);`;
const headerButton = css`text-align: left; width: 100%; background-color: var(--actionBar-buttonBackground); color: var(--actionBar-buttonForeground); padding: 0; cursor: pointer;`;

interface ActionButtonProps {
  fnKey: string;
  header: string;
}

export const ActionButton = memo(function ActionButton({ fnKey, header }: ActionButtonProps) {
  return (
    <span className={actionButton} onMouseDown={(e) => e.preventDefault()}>
      <span className={fnKeyClass}>{fnKey}</span>
      <div className={headerButton}>{header}</div>
    </span>
  );
});
