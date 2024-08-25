// import type { Dirent } from "@frdy/sdk";
// import { produce } from "immer";
// import { atom, useAtom } from "jotai";
// import { useCallback } from "react";
// import type { NodeLayout, TabLayout } from "../../types";
// import { type List, createList } from "../../utils/immutableList";
// import { traverseLayout, traverseLayoutRows } from "../../utils/layout";
// import type { CursorPosition, PanelState } from "./types";

// const activeTabAtom = atom<TabLayout>();
// const layoutAtom = atom<NodeLayout>();
// const statesAtom = atom<Record<string, PanelState | undefined>>({});

// export function usePanels() {
//   const [layout, setLayout] = useAtom(layoutAtom);
//   const [states, setStates] = useAtom(statesAtom);
//   const [activeTab, setActiveTab] = useAtom(activeTabAtom);

//   const resizeChildren = useCallback(
//     (id: string, flexes: number[]) =>
//       setLayout(
//         produce((s) => {
//           if (s) {
//             traverseLayoutRows(s, (panel) => {
//               if (panel.id === id) {
//                 panel.children.forEach((child, idx) => (child.flex = flexes[idx]));
//               }
//             });
//           }
//         }),
//       ),
//     [setLayout],
//   );

//   const setActiveTabId = useCallback(
//     (activeTabId: string) => {
//       if (layout) {
//         traverseLayout(layout, (tab) => {
//           if (tab.id === activeTabId) {
//             setActiveTab(tab);
//           }
//         });
//       }
//     },
//     [layout, setActiveTab],
//   );

//   const initPanelState = useCallback(
//     (id: string, state: PanelState) =>
//       setStates(
//         produce((s) => {
//           if (!s[id]) {
//             s[id] = state;
//           }
//         }),
//       ),
//     [setStates],
//   );

//   const setPanelItems = useCallback(
//     (id: string, items: List<Dirent>) =>
//       setStates(
//         produce((s) => {
//           const state = s[id];
//           if (!state?.targetPos) {
//             return;
//           }
//           state.items = items;
//           state.pos = state.targetPos;
//           state.stack.push(state.pos);
//         }),
//       ),
//     [setStates],
//   );

//   const setPanelSelectedItems = useCallback(
//     (id: string, itemNames: string[], select: boolean) =>
//       setStates(
//         produce((s) => {
//           const state = s[id];
//           if (!state) {
//             return;
//           }
//           const newItems = select ? new Set(state.selectedItems).union(new Set(itemNames)) : new Set(state.selectedItems).difference(new Set(itemNames));
//           state.selectedItems = createList(newItems);
//         }),
//       ),
//     [setStates],
//   );

//   const setPanelCursorPos = useCallback(
//     (id: string, cursorPos: CursorPosition) =>
//       setStates(
//         produce((s) => {
//           const state = s[id];
//           if (!state) {
//             return;
//           }
//           state.pos.cursor = cursorPos;
//           const pos = state.stack.at(-1);
//           if (pos) {
//             pos.cursor = cursorPos;
//           }
//         }),
//       ),
//     [setStates],
//   );

//   const focusNextPanel = useCallback(
//     (backward: boolean) => {
//       if (layout) {
//         let lastTraversedPanel: TabLayout | undefined;
//         let newActivePanelSet = false;
//         traverseLayout(
//           layout,
//           (panel) => {
//             if (lastTraversedPanel && !newActivePanelSet && panel.id === activeTab?.id) {
//               setActiveTabId(lastTraversedPanel.id);
//               newActivePanelSet = true;
//             }
//             lastTraversedPanel = panel;
//           },
//           !backward,
//         );
//         if (!newActivePanelSet && lastTraversedPanel) {
//           setActiveTabId(lastTraversedPanel.id);
//         }
//       }
//     },
//     [layout, activeTab, setActiveTabId],
//   );

//   const enterDir = useCallback(
//     () =>
//       setStates(
//         produce((s) => {
//           if (!layout) return;
//           // if (!activeFilePanel) {
//           //   return;
//           // }
//           // const state = s[activeFilePanel.id];
//           // if (!state) {
//           //   return;
//           // }

//           // const cursor = state.stack.at(-1);
//           // const activeItemPos = cursor?.cursor.activeIndex ?? 0;
//           // const activeItem = state.items.get(activeItemPos);
//           // if (activeItem && isDir(activeItem)) {
//           //   if (activeItem.filename === "..") {
//           //     const targetPath = truncateLastDir(state.pos.path);
//           //     if (targetPath === state.pos.path) {
//           //       return;
//           //     }
//           //     state.stack.pop();
//           //     const targetPos = state.stack.pop();
//           //     state.targetPos = {
//           //       path: targetPath,
//           //       cursor: targetPos?.cursor ?? {},
//           //     };
//           //   } else {
//           //     state.targetPos = {
//           //       path: combine(state.pos.path, activeItem.filename),
//           //       cursor: {},
//           //     };
//           //   }
//           // }
//         }),
//       ),
//     [layout, setStates],
//   );

//   return {
//     layout,
//     states,
//     activeTab,
//     setLayout,
//     resizeChildren,
//     setActiveTabId,
//     initPanelState,
//     setPanelItems,
//     setPanelSelectedItems,
//     setPanelCursorPos,
//     focusNextPanel,
//     enterDir,
//   };
// }

// export function usePanelState(id: string) {
//   return usePanels().states[id];
// }
