import { createComponent, EventName } from "@lit/react";
import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { range } from "lit/directives/range.js";
import React from "react";
import "../../../../lit-contexts/GlyphSizeProvider";
import { TabFilesCondensedView } from "../../../../types";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import { MeasureChangeEvent } from "../MultiColumnList";
import { View } from "./View";

const TAG = "frdy-condensed-view";

@customElement(TAG)
export class CondensedView extends View<TabFilesCondensedView> {
  @state()
  accessor columnCount = 1;

  private _onMeasureChange = (e: MeasureChangeEvent) => {
    this.columnCount = e.columnCount;
  }

  protected render() {
    const selectedNames = this.selectedItemNames.toSet();
    return html`
      <frdy-glyph-size-provider>
        <div style="display:grid;position:absolute;inset:0;grid-template-columns: repeat(${this.columnCount}, 1fr)">
          ${map(range(this.columnCount), (i) => html`<div style=${i < this.columnCount && "border-inline-end: 1px solid var(--panel-border);"}></div>`)}
        </div>
        <frdy-multicolumn-list
          .minColumnWidth=${250}
          .renderItem=${(i: number, isActive: boolean) => html`
            <frdy-column-cell
              .selected=${selectedNames.has(this.items.get(i)?.filename ?? "")}
              .cursorStyle=${isActive && this.cursorStyle === "firm" ? "firm" : "hidden"}
              .isTouchscreen=${this.isTouchscreen}
            >
              <frdy-filename .dirent=${this.items.get(i)} .icons=${this.icons}></frdy-filename>
            </frdy-column-cell>
          `}
          .itemsCount=${this.items.size()}
          .lineHeight=${1.2}
          .far=${true}
          @measure-change=${this._onMeasureChange}
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
    onActiveIndexChange: "active-index-change" as EventName<CustomEvent<{ activeIndex: number }>>,
  },
});
