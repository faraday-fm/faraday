import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import type { NodeLayout, RowLayout, TabSetLayout } from "../../types";
import { FrdyElement } from "../FrdyElement";
import "./RowContainer";
import "./Tabs";

const TAG = "frdy-layout-container";

@customElement(TAG)
export class LayoutContainer extends FrdyElement {
  static styles = css`
    :host {
      display: grid;
    }
  `;

  @property({ attribute: false })
  accessor layout: NodeLayout | undefined;

  @property({ attribute: false })
  accessor setLayout: ((layout: NodeLayout) => void) | undefined;

  @property()
  accessor direction: "h" | "v" = "h";

  protected render() {
    return html`${choose(
      this.layout?.type,
      [
        [
          "row",
          () => html`<frdy-row-container .direction=${this.direction} .layout=${this.layout as RowLayout} .setLayout=${this.setLayout}></frdy-row-container>`,
        ],
        ["tab-set", () => html`<frdy-tabs .layout=${this.layout as TabSetLayout} .setLayout=${this.setLayout}></frdy-tabs>`],
      ],
      () => html`<div>???</div>`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: LayoutContainer;
  }
}

// export const LayoutContainerReact = createComponent({
//   tagName: TAG,
//   elementClass: LayoutContainer,
//   react: React,
// });
