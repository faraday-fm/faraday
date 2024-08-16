// import type { Dirent } from "@frdy/sdk";
// import { html } from "lit";
// import { memo, useCallback } from "react";
// import { useGlyphSize } from "../../../../contexts/glyphSizeContext";
// import { useFs } from "../../../../features/fs/useFs";
// import { useMediaQuery } from "../../../../hooks/useMediaQuery";
// import type { List } from "../../../../utils/immutableList";
// import "../ColumnCell";
// import "../FileNameLit";
// import { MultiColumnListReact } from "../MultiColumnList";
// import type { CursorStyle } from "../types";

// interface CondensedViewProps {
//   items: List<Dirent>;
//   selectedItemNames: List<string>;
//   cursorStyle: CursorStyle;
//   topmostIndex: number;
//   selectedIndex: number;
//   columnCount: number;
//   onItemClicked?: (pos: number) => void;
//   onItemActivated?: (pos: number) => void;
//   onPosChange?: (e: Event) => void;
//   onMaxItemsPerColumnChange?: (e: Event) => void;
// }

// export const CondensedView = memo(function CondensedView({
//   cursorStyle,
//   items,
//   selectedItemNames,
//   topmostIndex,
//   selectedIndex,
//   columnCount,
//   onItemClicked,
//   onItemActivated,
//   onPosChange,
//   onMaxItemsPerColumnChange,
// }: CondensedViewProps) {
//   const { height: glyphHeight } = useGlyphSize();
//   const rowHeight = Math.ceil(glyphHeight);
//   const selectedNames = selectedItemNames.toSet();

//   const renderItem = useCallback(
//     (i: number) => {
//       return html`
//   <frdy-column-cell
//     .selected=${selectedNames.has(items.get(i)?.filename ?? "")}
//     .cursorStyle=${i === selectedIndex && cursorStyle === "firm" ? "firm" : "hidden"}
//     @mousedown=${() => onItemClicked?.(i)}
//     @doubleclick=${(e: MouseEvent) => {
//       onItemActivated?.(i);
//       e.stopPropagation();
//       e.preventDefault();
//     }}
//   >
//     <frdy-filename .height=${rowHeight} .dirent=${items.get(i)}></frdy-filename>
//   </frdy-column-cell>
//   `},
//     [items, rowHeight, cursorStyle, onItemActivated, onItemClicked, selectedIndex, selectedNames],
//   );

//   return (
//     <MultiColumnListReact
//       topmostIndex={topmostIndex}
//       activeIndex={selectedIndex}
//       columnCount={columnCount}
//       renderItem={renderItem}
//       itemsCount={items.size()}
//       itemHeight={rowHeight}
//       onPosChange={onPosChange}
//       onMaxItemsPerColumnChange={onMaxItemsPerColumnChange}
//       isTouchscreen={isTouchscreen}
//     />
//   );
// });
