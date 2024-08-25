import type { Dirent } from "@frdy/sdk";
import type { List } from "../../utils/list/List";

export interface CursorPosition {
  activeName?: string;
  activeIndex?: number;
  topmostName?: string;
  topmostIndex?: number;
}

export interface PanelPosition {
  path: string;
  cursor: CursorPosition;
}

export interface PanelState {
  items: List<Dirent>;
  selectedItems: List<string>;
  pos: PanelPosition;
  targetPos?: PanelPosition;
  stack: PanelPosition[];
}
