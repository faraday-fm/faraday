import type { Dirent } from "@frdy/sdk";
import { isDir, isHidden } from "@frdy/sdk";
import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useDirListing } from "../features/fs/hooks";
import { type CursorPosition, usePanelState, usePanels } from "../features/panels";
import { useSettings } from "../features/settings/settings";
import type { TabLayout } from "../types";
import { createList, empty } from "../utils/immutableList";
import { combine } from "../utils/path";
import { FilePanel, FilePanelReact } from "./panels/FilePanel/FilePanel";

const reduxFilePanelRoot = "reduxFilePanelRoot";
// css`
//   width: 100%;
//   height: 100%;
//   display: grid;
//   position: relative;
// `;

interface ReduxFilePanelProps {
  layout: TabLayout & { id: string };
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  usage: "sort",
  sensitivity: "case",
});

function fsCompare(a: Dirent, b: Dirent) {
  if (isDir(a) && !isDir(b)) return -1;
  if (!isDir(a) && isDir(b)) return 1;
  return collator.compare(a.filename, b.filename);
}

export const ReduxFilePanel = memo(function ReduxFilePanel({ layout }: ReduxFilePanelProps) {
  const { id } = layout;
  const panelRef = useRef<FilePanel>(null);
  const { activeTab, initPanelState, setPanelItems, setPanelSelectedItems, setPanelCursorPos, setActiveTabId } = usePanels();
  const state = usePanelState(id);
  // const updateState = useUpdateGlobalContext();
  const isActive = activeTab?.id === id;
  const { showHiddenFiles } = useSettings();

  let items = state?.items ?? createList();
  if (!showHiddenFiles) {
    items = items.filter((i) => !isHidden(i));
  }
  const selectedItems = state?.selectedItems ?? createList();
  const cursor = state?.pos.cursor ?? {};
  const activeItem = items ? items.get(cursor.activeIndex ?? 0) : undefined;

  useEffect(() => {
    if (isActive && state?.pos.path && activeItem) {
      // updateState({
      //   "filePanel.path": combine(state.pos.path, activeItem.filename),
      //   "filePanel.activeName": activeItem.filename,
      //   "filePanel.isFileActive": !isDir(activeItem),
      //   "filePanel.isDirectoryActive": isDir(activeItem),
      // });
      panelRef.current?.focus();
    }
  }, [isActive, activeItem, state?.pos.path]);

  useLayoutEffect(() => {
    const { path, id } = layout;
    const pos = { path, cursor: {} };
    initPanelState(id, { items: createList(), selectedItems: empty<string>(), pos, targetPos: pos, stack: [] });
  }, [initPanelState, layout]);

  useDirListing(
    state?.targetPos?.path,
    useCallback(
      (_, files) => {
        files = files.sort(fsCompare);
        setPanelItems(id, files);
      },
      [id, setPanelItems]
    )
  );

  const onFocus = useCallback(() => setActiveTabId(id), [id, setActiveTabId]);

  const selectionType = useRef<boolean>();
  const onCursorPositionChange = useCallback(
    (targetCursor: CursorPosition, select: boolean) => {
      if (select) {
        if (selectionType.current == null) {
          selectionType.current = selectedItems.findIndex((i) => i === cursor.activeName) < 0;
        }
        const isSelection = selectionType.current;
        let minIndex = 0;
        let maxIndex = 0;
        const sourceIdx = cursor.activeIndex ?? 0;
        const targetIdx = targetCursor.activeIndex ?? 0;

        if (sourceIdx < targetIdx) {
          minIndex = sourceIdx;
          maxIndex = targetIdx;
        } else {
          minIndex = targetIdx + 1;
          maxIndex = sourceIdx + 1;
        }
        const selectedNames = items.slice(minIndex, maxIndex).map((i) => i.filename);
        setPanelSelectedItems(id, Array.from(selectedNames), isSelection);
      } else {
        selectionType.current = undefined;
      }
      setPanelCursorPos(id, targetCursor);
    },
    [id, setPanelCursorPos, setPanelSelectedItems, selectedItems, cursor, items]
  );

  const onSelectItems = useCallback(
    (itemNames: string[], select: boolean) => {
      setPanelSelectedItems(id, itemNames, select);
    },
    [id, setPanelSelectedItems]
  );

  return (
    <div
      className={reduxFilePanelRoot}
      style={{ display: "grid" }}
      onKeyDown={() => {
        selectionType.current = undefined;
      }}
    >
      <FilePanelReact
        ref={panelRef}
        view={layout.component.view}
        items={items}
        selectedItemNames={selectedItems}
        showCursorWhenBlurred={isActive}
        // onFocus={onFocus}
        // onActiveIndexChange={onCursorPositionChange}
        // onSelectItems={onSelectItems}
        fileCursor={cursor}
        path={state ? state.pos.path : "/"}
      />
    </div>
  );
});
