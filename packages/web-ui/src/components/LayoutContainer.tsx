import { type MutableRefObject, useCallback, useRef } from "react";
import type { NodeLayout, RowLayout } from "../types";
import { TabsReact } from "./Tabs/Tabs";

const layoutSeparator = "layoutSeparator";
// css`position: relative;
//     z-index: 1;`;
const layoutSeparatorThumb = "layoutSeparatorThumb";
// css`position: absolute;
//     left: -2px;
//     right: -2px;
//     top: -2px;
//     bottom: -2px;`;
const layoutRow = "layoutRow";
// css`width: 100%;
//     display: flex;`;
const flexPanel = "flexPanel";
// css`display: flex;
//     flex-shrink: 0;
//     flex-basis: 1px;
//     overflow: hidden;`;

interface LayoutContainerProps<L> {
  layout: L;
  setLayout: (layout: L) => void;
  direction: "h" | "v";
}

function Separator({
  layout,
  setLayout,
  direction,
  items,
  index,
}: {
  layout: RowLayout;
  setLayout: (layout: RowLayout) => void;
  direction: "h" | "v";
  items: MutableRefObject<HTMLDivElement | null>[];
  index: number;
}) {
  const thumbRef = useRef<HTMLDivElement>(null);

  const beforeItem = items[index];
  const afterItem = items[index + 1];
  const pointerDownCoords = useRef<{ x: number; y: number } | undefined>();
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const dim = (r?: DOMRect) => (direction === "h" ? r?.width : r?.height);
      thumbRef.current?.setPointerCapture(e.pointerId);
      pointerDownCoords.current = { x: e.clientX, y: e.clientY };
      const bw = dim(beforeItem?.current?.getBoundingClientRect()) ?? 0;
      const aw = dim(afterItem?.current?.getBoundingClientRect()) ?? 0;
      const handlePointerMove = (e: PointerEvent) => {
        const sizes = Object.values(items).map((i) => dim(i?.current?.getBoundingClientRect()) ?? 1);
        const offs = direction === "h" ? e.clientX : e.clientY;
        let nbw = offs;
        let naw = bw + aw - offs;
        const p = nbw / (nbw + naw);
        if (Math.abs(p - 0.5) < 0.01) {
          nbw = naw = (nbw + naw) / 2;
        }
        sizes[index] = nbw;
        sizes[index + 1] = naw;
        setLayout({ ...layout, children: layout.children.map((c, idx) => ({ ...c, flex: sizes[idx] })) });
      };
      const handlePointerUp = (e: PointerEvent) => {
        window.removeEventListener("pointermove", handlePointerMove);
        thumbRef.current?.releasePointerCapture(e.pointerId);
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp, { once: true });
    },
    [afterItem, beforeItem, direction, items, setLayout, layout, index]
  );
  return (
    <div className={layoutSeparator}>
      <div
        ref={thumbRef}
        className={layoutSeparatorThumb}
        style={{ cursor: direction === "h" ? "col-resize" : "row-resize" }}
        onPointerDown={handlePointerDown}
      />
    </div>
  );
}

function RowContainer({ layout, direction, setLayout }: LayoutContainerProps<RowLayout>) {
  const items: MutableRefObject<HTMLDivElement | null>[] = [];
  for (let i = 0; i < layout.children.length; i++) {
    items.push({ current: null });
  }
  return (
    <div className={layoutRow} style={{ flexDirection: direction === "h" ? "row" : "column" }}>
      {layout.children.map((l, idx) => (
        <div key={l.id} style={{display: "contents"}}>
          {idx > 0 && <Separator layout={layout} setLayout={setLayout} direction={direction} items={items} index={idx - 1} />}
          <div ref={items[idx]} className={flexPanel} style={{ flexGrow: l.flex ?? 1 }}>
            <LayoutContainer
              layout={l}
              direction={direction === "h" ? "v" : "h"}
              setLayout={(t: any) => setLayout({ ...layout, children: layout.children.toSpliced(idx, 1, t) })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LayoutContainer({ layout, setLayout, direction }: LayoutContainerProps<NodeLayout>) {
  switch (layout.type) {
    case "row":
      return <RowContainer layout={layout} direction={direction} setLayout={setLayout} />;
    case "tab-set":
      return <TabsReact tabIndex={-1} layout={layout} setLayout={setLayout} />;
    // case "tab":
    //   return <Tab layout={layout} />;
    default:
      return null;
  }
}
