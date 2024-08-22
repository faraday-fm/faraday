import { html } from "lit";
import { customElement } from "lit/decorators.js";
import "../../../../lit-contexts/GlyphSizeProvider";
import { TabFilesCondensedView } from "../../../../types";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import { View } from "./View";

const TAG = "frdy-condensed-view";

@customElement(TAG)
export class CondensedView extends View<TabFilesCondensedView> {
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
          .far=${true}
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

// export const CondensedViewReact = createComponent({
//   tagName: TAG,
//   elementClass: CondensedView,
//   react: React,
//   events: {
//     onActiveIndexChange: "active-index-change" as EventName<CustomEvent<{ activeIndex: number }>>,
//   },
// });
