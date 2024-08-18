import type { Dirent } from "@frdy/sdk";
import { css, CSSResultGroup, LitElement } from "lit";
import { property } from "lit/decorators.js";
import "../../../../lit-contexts/GlyphSizeProvider";
import { createList, type List } from "../../../../utils/immutableList";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import type { CursorStyle } from "../types";
import { TabFilesView } from "../../../../types";

export abstract class View<T extends TabFilesView> extends LitElement {
  static styles = css`
    :host {
      display: grid;
    }
  ` as CSSResultGroup;

  @property({ attribute: false })
  view?: T;

  @property()
  cursorStyle: CursorStyle;

  @property({ attribute: false })
  items: List<Dirent>;

  @property({ attribute: false })
  selectedItemNames: List<string>;

  @property({ type: Number })
  topmostIndex: number;

  @property({ type: Number })
  activeIndex: number;

  @property({ type: Number })
  columnCount: number;

  constructor() {
    super();
    this.cursorStyle = "firm";
    this.items = createList();
    this.selectedItemNames = createList();
    this.topmostIndex = 0;
    this.activeIndex = 0;
    this.columnCount = 1;
  }
}
