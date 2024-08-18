import type { Dirent } from "@frdy/sdk";
import { createComponent } from "@lit/react";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import "../../../../lit-contexts/GlyphSizeProvider";
import { createList, type List } from "../../../../utils/immutableList";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import type { CursorStyle } from "../types";

const TAG = "frdy-condensed-view";

@customElement(TAG)
export class CondensedView extends LitElement {
  static styles = css`
    :host {
      display: grid;
    }
  `;

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

  protected render() {
    const selectedNames = this.selectedItemNames.toSet();
    const rowHeight = 25;
    return html`
      <frdy-glyph-size-provider>
        <frdy-multicolumn-list
          .minColumnWidth=${250}
          .renderItem=${(i: number, isActive: boolean) => html`
            <frdy-column-cell
              .selected=${selectedNames.has(this.items.get(i)?.filename ?? "")}
              .cursorStyle=${isActive && this.cursorStyle === "firm" ? "firm" : "hidden"}
            >
              <frdy-filename .dirent=${this.items.get(i)}></frdy-filename>
            </frdy-column-cell>
          `}
          .itemsCount=${this.items.size()}
          .itemHeight=${rowHeight}
        ></frdy-multicolumn-list>
      </frdy-glyph-size-provider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: CondensedView;
  }
}

export const CondensedViewReact = createComponent({
  tagName: TAG,
  elementClass: CondensedView,
  react: React,
  events: {
    onActiveIndexChange: "active-index-change",
    onItemsPerColumnChange: "items-per-column-change",
  },
});
