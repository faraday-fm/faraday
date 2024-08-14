import { css } from "@css";
import type { Dirent } from "@frdy/sdk";
import type { CursorPosition } from "../../../../features/panels";
import type { List } from "../../../../utils/immutableList";
import { Column } from "../Column";
import type { ColumnDef, CursorStyle } from "../types";

const fullViewColumns = css`display: grid;
    overflow: hidden;`;

interface FullViewProps {
  items: List<Dirent>;
  cursor: Required<CursorPosition>;
  cursorStyle: CursorStyle;
  columnDefs: ColumnDef[];
  onMaxVisibleItemsChanged?: (count: number) => void;
  onItemClicked?: (pos: number) => void;
  onItemActivated?: (pos: number) => void;
}

export function FullView({ items, cursor, cursorStyle, columnDefs, onMaxVisibleItemsChanged, onItemClicked, onItemActivated }: FullViewProps) {
  const columns = new Array(columnDefs.length);

  const gridTemplateColumns = columnDefs.map((def) => def.width ?? "auto").join(" ");

  for (let i = 0; i < columnDefs.length; i += 1) {
    columns.push(
      <Column
        key={i}
        items={items}
        columnDef={columnDefs[i]!}
        selectedIndex={cursor.activeIndex}
        topmostIndex={cursor.topmostIndex}
        cursorStyle={cursorStyle}
        onMaxItemsCountChange={onMaxVisibleItemsChanged}
        selectItem={onItemClicked}
        activateItem={onItemActivated}
      />,
    );
  }
  return (
    <div className={fullViewColumns} style={{ gridTemplateColumns }}>
      {columns}
    </div>
  );
}
