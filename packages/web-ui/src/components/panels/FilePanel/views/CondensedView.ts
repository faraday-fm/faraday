import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../../../contexts/GlyphSizeProvider";
import { TabFilesCondensedView } from "../../../../types";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import { View } from "./View";
import { FrdyElement } from "../../../FrdyElement";

const TAG = "frdy-condensed-view";

@customElement(TAG)
export class CondensedView extends View<TabFilesCondensedView> {
  static shadowRootOptions: ShadowRootInit = { ...FrdyElement.shadowRootOptions, delegatesFocus: true };

  protected render() {
    const selectedNames = this.selectedItemNames.toSet();
    return html`
      <frdy-glyph-size-provider>
        <frdy-multicolumn-list
          .minColumnWidth=${250}
          .topmostIndex=${this.topmostIndex}
          .activeIndex=${this.activeIndex}
          .renderItem=${(index: number, isActive: boolean) => this.renderItem(index, isActive, selectedNames)}
          .itemsCount=${this.items.size()}
          .lineHeight=${1.4}
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
