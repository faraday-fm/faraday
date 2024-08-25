import type { TabSetLayout, TabLayout, NodeLayout, RowLayout } from "../types";

export function traverseLayout(layout: NodeLayout, callback: (tab: TabLayout) => void, reverse = false) {
  switch (layout.type) {
    case "row":
    case "tab-set":
      if (reverse) {
        layout.children.toReversed().forEach((c) => traverseLayout(c, callback, true));
      } else {
        layout.children.forEach((c) => traverseLayout(c, callback));
      }
      break;
    case "tab":
      callback(layout);
      break;
  }
}

export function traverseLayoutRows(layout: NodeLayout, callback: (row: RowLayout) => void, reverse = false) {
  switch (layout.type) {
    case "row":
      callback(layout);
      if (reverse) {
        layout.children.toReversed().forEach((c) => traverseLayoutRows(c, callback, true));
      } else {
        layout.children.forEach((c) => traverseLayoutRows(c, callback));
      }
      break;
  }
}
