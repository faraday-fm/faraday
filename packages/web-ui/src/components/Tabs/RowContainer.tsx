import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";
import type { RowLayout } from "../../types";
// import "./LayoutContainer";
import { FrdyElement } from "../FrdyElement";
import "./Separator";
import "./Tabs";

const TAG = "frdy-row-container";

@customElement(TAG)
export class RowContainer extends FrdyElement {
  static styles = css`
    :host {
      display: grid;
    }
    .row {
      width: 100%;
      display: flex;
      gap: 2px;
    }
    .flexPanel {
      display: grid;
      overflow: hidden;
      flex-basis: 1px;
    }
  `;
  @property({ attribute: false })
  accessor layout: RowLayout | undefined;

  @property({ attribute: false })
  accessor setLayout: ((layout: RowLayout) => void) | undefined;

  @property()
  accessor direction: "h" | "v" = "h";

  protected render() {
    if (!this.layout) {
      return nothing;
    }
    const items: Ref<HTMLDivElement>[] = [];
    for (let i = 0; i < this.layout.children.length; i++) {
      items.push(createRef());
    }
    return html`<div class="row" style="flex-direction: ${this.direction === "h" ? "row" : "column"}">
      ${this.layout.children.map(
        (l, idx) =>
          html`${when(
              idx > 0,
              () =>
                html`<frdy-separator
                  .layout=${this.layout}
                  .setLayout=${this.setLayout}
                  .direction=${this.direction}
                  .items=${items}
                  .index=${idx - 1}
                ></frdy-separator>`
            )}
            <div ref=${ref(items[idx])} class="flexPanel" style="flex-grow: ${l.flex ?? 1}">
              <frdy-layout-container
                .layout=${l}
                .direction=${this.direction === "h" ? "v" : "h"}
                .setLayout=${(t: any) => this.setLayout?.({ ...this.layout!, children: this.layout!.children.toSpliced(idx, 1, t) })}
              ></frdy-layout-container>
            </div>`
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: RowContainer;
  }
}
