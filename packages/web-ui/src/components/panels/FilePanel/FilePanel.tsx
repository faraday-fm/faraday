import { css } from "@css";
import { useCommandBinding, useExecuteCommand, useSetContextVariable } from "@frdy/commands";
import type { Dirent } from "@frdy/sdk";
import { isDir } from "@frdy/sdk";
import equal from "fast-deep-equal";
import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { GlyphSizeProvider } from "../../../contexts/glyphSizeContext";
import type { CursorPosition } from "../../../features/panels";
import { useElementSize } from "../../../hooks/useElementSize";
import { useFocused } from "../../../hooks/useFocused";
import { usePrevValueIfDeepEqual } from "../../../hooks/usePrevValueIfDeepEqual";
import type { TabFilesView } from "../../../types";
import type { List } from "../../../utils/immutableList";
import { clamp } from "../../../utils/number";
import { Border } from "../../Border";
import { Breadcrumb } from "../../Breadcrumb";
import { PanelHeader } from "../../PanelHeader";
import { FileInfoFooter } from "./FileInfoFooter";
import type { CursorStyle } from "./types";
import clsx from "clsx";
import { useFs } from "../../../features/fs/useFs";
import { CondensedViewReact } from "./CondensedView";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

const panelRoot = css`
  width: 100%;
  height: 100%;
  position: relative;
  color: var(--panel-foreground);
  background-color: var(--panel-background);
  display: grid;
  overflow: hidden;
  outline: none;
  user-select: none;

  &.-focused {
    background-color: var(--panel-background-focus);
  }
`;
const panelContent = css`
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  overflow: hidden;
`;
const panelColumns = css`
  display: grid;
  flex-shrink: 1;
  flex-grow: 1;
  overflow: hidden;

  &:focus {
    outline: none;
  }
`;
const fileInfoPanel = css`
  /* border: 1px solid var(--color-11);
    padding: calc(0.5rem - 1px) calc(0.25rem - 1px);
    color: var(--color-11); */
  margin: 2px;
  margin-top: 0;
  border: 1px solid var(--panel-border);
  overflow: hidden;
`;
const panelFooter = css`
  /* position: absolute; */
  /* bottom: 0;
    left: 50%;
    transform: translate(-50%, 0); */
  /* max-width: calc(100% - 2em); */
  /* z-index: 1; */
  margin: 2px;
  margin-top: 0;
  border: 1px solid var(--panel-border);
  padding: 0 0.25em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

export interface FilePanelProps {
  items: List<Dirent>;
  selectedItemNames: List<string>;
  cursor: CursorPosition;
  view: TabFilesView;
  path: string;
  showCursorWhenBlurred?: boolean;
  onFocus?: () => void;
  onCursorPositionChange: (newPosition: CursorPosition, select: boolean) => void;
  onSelectItems: (names: string[], select: boolean) => void;
}

export interface FilePanelActions {
  focus(): void;
}

function adjustCursor(cursor: CursorPosition, items: List<Dirent>, displayedItems: number): Required<CursorPosition> {
  let selectedIndex = cursor.activeIndex ?? 0;
  let topmostIndex = cursor.topmostIndex ?? 0;
  const selectedName = cursor.activeName ?? items.get(selectedIndex)?.filename;
  const topmostName = cursor.topmostName ?? items.get(topmostIndex)?.filename;

  selectedIndex = clamp(0, selectedIndex, items.size() - 1);
  topmostIndex = clamp(0, topmostIndex, items.size() - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);

  const updateIndexByName = (name: string | undefined, fallbackIndex: number) => {
    if (name !== items.get(fallbackIndex)?.filename) {
      const idx = items.findIndex((i) => i.filename === name);
      if (idx >= 0) {
        return idx;
      }
    }
    return fallbackIndex;
  };

  selectedIndex = updateIndexByName(selectedName, selectedIndex);
  topmostIndex = updateIndexByName(topmostName, topmostIndex);

  topmostIndex = clamp(0, topmostIndex, items.size() - displayedItems);
  topmostIndex = clamp(selectedIndex - displayedItems + 1, topmostIndex, selectedIndex);
  return {
    activeIndex: selectedIndex,
    topmostIndex,
    activeName: selectedName ?? "",
    topmostName: topmostName ?? "",
  };
}

export const FilePanel = memo(
  forwardRef<FilePanelActions, FilePanelProps>((props, ref) => {
    const { items, selectedItemNames, cursor, view, path, showCursorWhenBlurred, onFocus, onCursorPositionChange } = props;
    const fs = useFs();
    const isTouchscreen = useMediaQuery("(pointer: coarse)");

    const onFocusRef = useRef(onFocus);
    const onCursorPositionChangeRef = useRef(onCursorPositionChange);
    onCursorPositionChangeRef.current = onCursorPositionChange;

    const panelRootRef = useRef<HTMLDivElement>(null);
    const { width } = useElementSize(panelRootRef);
    const [maxItemsPerColumn, setMaxItemsPerColumn] = useState<number>();

    const columnCount = useMemo(() => {
      if (view.type === "full") return 1;
      return width ? Math.ceil(width / 350) : undefined;
    }, [view.type, width]);

    const displayedItems = columnCount && maxItemsPerColumn ? Math.min(items.size(), maxItemsPerColumn * columnCount) : 1;

    const adjustedCursor = usePrevValueIfDeepEqual(adjustCursor(cursor, items, displayedItems));
    const focused = useFocused(panelRootRef);

    useImperativeHandle(ref, () => ({
      focus: () => panelRootRef.current?.focus(),
    }));

    useSetContextVariable("filePanel.focus", true, focused);
    useSetContextVariable("filePanel.firstItem", cursor.activeIndex === 0, focused);
    useSetContextVariable("filePanel.lastItem", cursor.activeIndex === items.size() - 1, focused);
    useSetContextVariable("filePanel.activeItem", cursor.activeName, focused);
    useSetContextVariable("filePanel.path", path, focused);
    useSetContextVariable("filePanel.totalItemsCount", items.size(), focused);
    useSetContextVariable("filePanel.selectedItemsCount", selectedItemNames.size(), focused);

    const moveCursorLeftRight = useCallback(
      (direction: "left" | "right", select: boolean) => {
        let newCursor = structuredClone(adjustedCursor);
        if (direction === "right") {
          newCursor.activeIndex += maxItemsPerColumn ?? 0;
          if (newCursor.activeIndex >= newCursor.topmostIndex + displayedItems) {
            newCursor.topmostIndex += maxItemsPerColumn ?? 0;
          }
        } else if (direction === "left") {
          newCursor.activeIndex -= maxItemsPerColumn ?? 0;
          if (newCursor.activeIndex < newCursor.topmostIndex) {
            newCursor.topmostIndex -= maxItemsPerColumn ?? 0;
          }
        }
        newCursor.activeName = items.get(newCursor.activeIndex)?.filename ?? "";
        newCursor.topmostName = items.get(newCursor.topmostIndex)?.filename ?? "";
        newCursor = adjustCursor(newCursor, items, displayedItems);
        if (!equal(newCursor, adjustedCursor)) {
          onCursorPositionChangeRef.current(newCursor, select);
        }
      },
      [adjustedCursor, displayedItems, items, maxItemsPerColumn]
    );

    const adjustedCursorRef = useRef(adjustedCursor);
    adjustedCursorRef.current = adjustedCursor;
    const scroll = useCallback(
      (delta: number, followCursor: boolean, select: boolean) => {
        let c = structuredClone(adjustedCursorRef.current);
        c.activeIndex += delta;
        if (followCursor) {
          c.topmostIndex += delta;
        }
        c.activeName = items.get(c.activeIndex)?.filename ?? "";
        c.topmostName = items.get(c.topmostIndex)?.filename ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursorRef.current)) {
          onCursorPositionChangeRef.current(c, select);
        }
      },
      [items, displayedItems]
    );

    const moveCursorToPos = useCallback(
      (pos: number, select: boolean) => {
        let c = structuredClone(adjustedCursor);
        c.activeIndex = pos;
        c.activeName = items.get(pos)?.filename ?? "";
        c.topmostName = items.get(c.topmostIndex)?.filename ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursor)) {
          onCursorPositionChangeRef.current(c, select);
        }
      },
      [adjustedCursor, displayedItems, items]
    );

    const moveCursorPage = useCallback(
      (direction: "up" | "down", select: boolean) => {
        let c = structuredClone(adjustedCursor);
        if (direction === "up") {
          c.activeIndex -= displayedItems - 1;
          c.topmostIndex -= displayedItems - 1;
        } else if (direction === "down") {
          c.activeIndex += displayedItems - 1;
          c.topmostIndex += displayedItems - 1;
        }
        c.activeName = items.get(c.activeIndex)?.filename ?? "";
        c.topmostName = items.get(c.topmostIndex)?.filename ?? "";
        c = adjustCursor(c, items, displayedItems);
        if (!equal(c, adjustedCursor)) {
          onCursorPositionChangeRef.current(c, select);
        }
      },
      [adjustedCursor, displayedItems, items]
    );

    useCommandBinding("cursorLeft", () => moveCursorLeftRight("left", false), focused);
    useCommandBinding("cursorRight", () => moveCursorLeftRight("right", false), focused);
    useCommandBinding("cursorUp", () => scroll(-1, false, false), focused);
    useCommandBinding("cursorDown", () => scroll(1, false, false), focused);
    useCommandBinding("cursorStart", () => moveCursorToPos(0, false), focused);
    useCommandBinding("cursorEnd", () => moveCursorToPos(items.size() - 1, false), focused);
    useCommandBinding("cursorPageUp", () => moveCursorPage("up", false), focused);
    useCommandBinding("cursorPageDown", () => moveCursorPage("down", false), focused);

    useCommandBinding("selectLeft", () => moveCursorLeftRight("left", true), focused);
    useCommandBinding("selectRight", () => moveCursorLeftRight("right", true), focused);
    useCommandBinding("selectUp", () => scroll(-1, false, true), focused);
    useCommandBinding("selectDown", () => scroll(1, false, true), focused);
    useCommandBinding("selectStart", () => moveCursorToPos(0, true), focused);
    useCommandBinding("selectEnd", () => moveCursorToPos(items.size() - 1, true), focused);
    useCommandBinding("selectPageUp", () => moveCursorPage("up", true), focused);
    useCommandBinding("selectPageDown", () => moveCursorPage("down", true), focused);

    const executeCommand = useExecuteCommand();
    // const onItemActivate = useCallback(() => executeCommand("open", { path }), [executeCommand, path]);

    const onMaxItemsPerColumnChange = useCallback((e: Event) => {
      setMaxItemsPerColumn((e as CustomEvent).detail.maxItemsPerColumn);
    }, []);
    // const onItemClicked = useCallback((pos: number) => moveCursorToPos(pos, false), [moveCursorToPos]);
    const selectedIndexRef = useRef(cursor.activeIndex);
    selectedIndexRef.current = cursor.activeIndex;
    const onActiveIndexChange = useCallback(
      (e: Event) => {
        const { activeIndex, initiator } = (e as CustomEvent).detail;
        if (initiator === 'scroll') {
          scroll(activeIndex - (selectedIndexRef.current ?? 0), true, false);
        } else if (initiator === 'click') {
          moveCursorToPos(activeIndex, false);
        }
      },
      [scroll]
    );
    const handleFocus = useCallback(() => onFocusRef.current?.(), []);

    let cursorStyle: CursorStyle;
    if (focused) {
      cursorStyle = "firm";
    } else if (showCursorWhenBlurred) {
      cursorStyle = "inactive";
    } else {
      cursorStyle = "hidden";
    }

    const bytesCount = useMemo(() => items.reduce((acc, item) => acc + ((!isDir(item) ? item.attrs.size : 0) ?? 0), 0), [items]);
    const filesCount = useMemo(() => items.reduce((acc, item) => acc + (!isDir(item) ? 1 : 0), 0), [items]);

    const pathParts = path.split("/");
    if (!columnCount) {
      return <div className={clsx(panelRoot, focused && "-focused")} ref={panelRootRef} tabIndex={0} onFocus={handleFocus} />;
    }

    return (
      <div
        className={clsx(panelRoot, focused && "-focused")}
        ref={panelRootRef}
        tabIndex={0}
        onFocus={handleFocus}
        onWheel={() => panelRootRef.current?.focus()}
      >
        <GlyphSizeProvider>
          <Border color={focused ? "panel-border-focus" : "panel-border"}>
            <div className={panelContent}>
              <PanelHeader active={focused}>
                <Breadcrumb isActive={focused}>
                  {pathParts.map((x, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <Breadcrumb.Item key={i}>{x}</Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              </PanelHeader>
              <div
                className={panelColumns}
                // onWheel={(e) => scroll(Math.sign(e.deltaY), true)}
                onKeyDown={(e) => {
                  // dispatch({ type: "findFirst", char: e.key });
                  e.preventDefault();
                }}
              >
                {view.type === "condensed" && (
                  <CondensedViewReact
                    ref={(ref) => ref?.setFs(fs)}
                    cursorStyle={cursorStyle}
                    items={items}
                    selectedItemNames={selectedItemNames}
                    topmostIndex={adjustedCursor.topmostIndex}
                    activeIndex={adjustedCursor.activeIndex}
                    columnCount={columnCount}
                    isTouchscreen={isTouchscreen}
                    onMaxItemsPerColumnChange={onMaxItemsPerColumnChange}
                    onActiveIndexChange={onActiveIndexChange}
                  />
                )}
              </div>
              <div className={fileInfoPanel}>
                <FileInfoFooter file={items.get(adjustedCursor.activeIndex)} />
              </div>
              <div className={panelFooter}>{`${bytesCount.toLocaleString()} bytes in ${filesCount.toLocaleString()} files`}</div>
            </div>
          </Border>
        </GlyphSizeProvider>
      </div>
    );
  })
);
FilePanel.displayName = "FilePanel";
