import { css } from "@css";
import { type ReactNode, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useElementSize } from "../../../hooks/useElementSize";
import ScrollableContainer from "./ScrollableContainer";

const columnBorder = css`
overflow: hidden;
  border-right: 1px solid var(--panel-border);
  /* border-right-width: 0; */
  &:last-child {
    border-right-width: 0px;
  }`;
const columnsScroller = css`position: relative;
    overflow: hidden;`;
const columnsScrollerFixed = css`position: absolute;
    inset: 0;
    overflow: hidden;
    `;

export interface MultiColumnListProps {
  topmostIndex: number;
  activeIndex: number;
  columnCount: number;
  totalCount: number;
  itemHeight: number;
  renderItem(index: number): ReactNode;
  onPosChange: (newTopmostItem: number, newActiveItem: number) => void;
  onMaxItemsPerColumnChanged?: (count: number) => void;
}

export const MultiColumnList = memo((props: MultiColumnListProps) => {
  let { topmostIndex, activeIndex, columnCount, totalCount, itemHeight, renderItem, onPosChange, onMaxItemsPerColumnChanged } = props;

  if (!Number.isInteger(itemHeight) || itemHeight <= 0) {
    throw new Error("itemHeight should be positive");
  }

  const onPosChangeRef = useRef(onPosChange);
  const onMaxItemsPerColumnChangedRef = useRef(onMaxItemsPerColumnChanged);
  onPosChangeRef.current = onPosChange;
  onMaxItemsPerColumnChangedRef.current = onMaxItemsPerColumnChanged;

  const rootRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const { height } = useElementSize(rootRef);
  const itemsPerColumn = Math.max(1, Math.floor(height / itemHeight));

  useLayoutEffect(() => {
    onMaxItemsPerColumnChangedRef.current?.(itemsPerColumn);
  }, [itemsPerColumn]);

  if (activeIndex < topmostIndex) {
    topmostIndex = activeIndex;
  } else if (activeIndex > topmostIndex + columnCount * itemsPerColumn - 1) {
    topmostIndex = activeIndex - columnCount * itemsPerColumn + 1;
  } else if (topmostIndex > totalCount - columnCount * itemsPerColumn) {
    topmostIndex = Math.max(0, totalCount - columnCount * itemsPerColumn);
  }

  const topmostIndexRef = useRef(topmostIndex);
  const activeIndexRef = useRef(activeIndex);
  topmostIndexRef.current = topmostIndex;
  activeIndexRef.current = activeIndex;

  const items = useMemo(() => {
    const itemsSlice = [];
    for (let i = topmostIndex; i < topmostIndex + Math.min(totalCount, columnCount * itemsPerColumn); i++) {
      itemsSlice.push(
        <div key={i} style={{ height: itemHeight }}>
          {renderItem(i)}
        </div>,
      );
    }
    return itemsSlice;
  }, [columnCount, renderItem, itemHeight, itemsPerColumn, topmostIndex, totalCount]);

  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    setScrollTop(activeIndex * itemHeight);
  }, [itemHeight, activeIndex]);

  const onScroll = useCallback(
    (scrollTop: number) => {
      setScrollTop(scrollTop);
      const newActiveItem = Math.round(scrollTop / itemHeight);
      const delta = newActiveItem - activeIndexRef.current;
      if (delta) {
        onPosChangeRef.current?.(topmostIndexRef.current + delta, newActiveItem);
      }
    },
    [itemHeight],
  );

  const columnItems: (typeof items)[] = [];
  const slice = (column: number) => items.slice(column * itemsPerColumn, (column + 1) * itemsPerColumn);
  for (let i = 0; i < columnCount; i++) {
    columnItems[i] = slice(i);
  }

  return (
    <div className={columnsScroller} ref={rootRef}>
      {/* <Borders columnCount={columnCount} /> */}

      <ScrollableContainer
        scrollTop={scrollTop}
        scrollHeight={(totalCount - 1) * itemHeight}
        style={{ height: "100%" }}
        innerContainerStyle={{ width: "100%", height: "100%" }}
        onScroll={onScroll}
      >
        <div
          className={columnsScrollerFixed}
          ref={fixedRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            overflow: "hidden",
          }}
        >
          {columnItems.map((items, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={i} className={columnBorder}>
              {items}
            </div>
          ))}
        </div>
      </ScrollableContainer>
    </div>
  );
});
