import { css } from "@css";
import { memo } from "react";
import { ActionButton } from "./ActionButton";
import { useKeyCommand } from "@frdy/commands";

const actionsBar = css`display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    overflow: hidden;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;`;

function ActionKey({ fnKey, header }: { fnKey: string; header: string }) {
  const r = useKeyCommand(`F${fnKey}`);
  return <ActionButton fnKey={fnKey} header={r} />;
}

export const ActionsBar = memo(function ActionsBar() {
  return (
    <div className={actionsBar} tabIndex={-1}>
      <ActionKey fnKey="1" header="Help" />
      <ActionKey fnKey="2" header="Menu" />
      <ActionKey fnKey="3" header="View" />
      <ActionKey fnKey="4" header="Edit" />
      <ActionKey fnKey="5" header="Copy" />
      <ActionKey fnKey="6" header="RenMov" />
      <ActionKey fnKey="7" header="Mkdir" />
      <ActionKey fnKey="8" header="Delete" />
      <ActionKey fnKey="9" header="ConfMn" />
      <ActionKey fnKey="10" header="Quit" />
      <ActionKey fnKey="11" header="Plugins" />
      <ActionKey fnKey="12" header="Screens" />
    </div>
  );
});
