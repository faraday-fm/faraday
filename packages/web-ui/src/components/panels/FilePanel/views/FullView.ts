import { createComponent, EventName } from "@lit/react";
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { range } from "lit/directives/range.js";
import React from "react";
import "../../../../lit-contexts/GlyphSizeProvider";
import { TabFilesFullView } from "../../../../types";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import { get } from "../utils";
import { View } from "./View";

const TAG = "frdy-full-view";

@customElement(TAG)
export class FullView extends View<TabFilesFullView> {

  protected render() {
    const columnDefs = this.view?.columnDefs ?? [];
    const selectedNames = this.selectedItemNames.toSet();
    const columnWidths = `1fr ${columnDefs.map((d) => `${d.flex ?? 1}fr`).join(" ")}`;
    return html`
      <frdy-glyph-size-provider>
        <div style="display:grid;position:relative;">
          <div style="display:grid;position:absolute;inset:0;grid-template-columns: ${columnWidths}">
            ${map(range(columnDefs.length + 1), (i) => html`<div style=${i < columnDefs.length && "border-inline-end: 1px solid var(--panel-border);"}></div>`)}
          </div>
          <frdy-multicolumn-list
            .renderItem=${(i: number, isActive: boolean) => html`
              <frdy-column-cell
                style="overflow:hidden;text-overflow: ellipsis;"
                .selected=${selectedNames.has(this.items.get(i)?.filename ?? "")}
                .cursorStyle=${isActive && this.cursorStyle === "firm" ? "firm" : "hidden"}
                .isTouchscreen=${this.isTouchscreen}
              >
                <div style="display: grid; grid-template-columns: ${columnWidths}">
                  <frdy-filename .dirent=${this.items.get(i)} .icons=${this.icons}></frdy-filename>
                  ${map(columnDefs, (d) => html`<div style="overflow:hidden;text-overflow: ellipsis;">${String(get(this.items.get(i), d.field))}</div>`)}
                </div>
              </frdy-column-cell>
            `}
            .itemsCount=${this.items.size()}
            .lineHeight=${1.2}
            .far=${true}
            ></frdy-multicolumn-list>
        </div>
      </frdy-glyph-size-provider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FullView;
  }
}

export const FullViewReact = createComponent({
  tagName: TAG,
  elementClass: FullView,
  react: React,
  events: {
    onActiveIndexChange: "active-index-change" as EventName<CustomEvent<{ activeIndex: number }>>,
  },
});
