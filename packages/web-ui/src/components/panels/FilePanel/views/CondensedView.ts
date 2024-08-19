import { createComponent } from "@lit/react";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import "../../../../lit-contexts/GlyphSizeProvider";
import { TabFilesCondensedView } from "../../../../types";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import { View } from "./View";
import { consume } from "@lit/context";
import { IconsCache, iconsCacheContext } from "../../../../lit-contexts/iconsCacheContext";
import { isTouchScreenContext } from "../../../../lit-contexts/IsTouchScreenProvider";

const TAG = "frdy-condensed-view";

@customElement(TAG)
export class CondensedView extends View<TabFilesCondensedView> {
  @consume({ context: iconsCacheContext })
  accessor icons!: IconsCache;

  @consume({ context: isTouchScreenContext, subscribe: true })
  accessor isTouchscreen!: boolean;

  protected render() {
    const selectedNames = this.selectedItemNames.toSet();
    return html`
      <frdy-glyph-size-provider>
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
