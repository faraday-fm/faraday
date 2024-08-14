import { css } from "@css";
import type { PropsWithChildren } from "react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import type { CursorStyle } from "./types";
import clsx from "clsx";

const cell = css`display: flex;
    margin-right: 1px;
    cursor: default;
    overflow: hidden;
    padding: 0 2px;
    /* margin: 0 2px; */
    border-radius: 2px;
    border: 1px solid transparent;

    &:is(.-firm, .-inactive) {
      background-color: var(--files-file-background-focus);
      border: 1px solid var(--files-file-border-focus);
    }`;

interface CellProps {
  cursorStyle: CursorStyle;
  selected?: boolean;
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

// function createDragGhost() {
//   const div = document.createElement("div");
//   div.innerText = "Copy !@#$";
//   div.style.transform = "translate(-10000px, -10000px)";
//   div.style.position = "absolute";
//   document.body.appendChild(div);
//   return div;
// }

export function Cell({ children, selected, cursorStyle, onMouseDown, onMouseOver, onDoubleClick }: PropsWithChildren<CellProps>) {
  const isTouchscreen = useMediaQuery("(pointer: coarse)");

  const clickHandler = isTouchscreen ? { onClick: onDoubleClick } : { onDoubleClick };

  return (
    <div
      draggable
      className={clsx(cell, `-${cursorStyle}`, selected && "-selected")}
      style={{ background: selected ? "red" : undefined }}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      {...clickHandler}
    >
      {children}
    </div>
  );
}
