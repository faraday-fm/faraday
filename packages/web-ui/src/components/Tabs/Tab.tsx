import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import * as v from "../../css";
import type { TabLayout } from "../../types";
import { FrdyElement } from "../FrdyElement";
import "./FilePanelTab";

const TAG = "frdy-tab";

@customElement(TAG)
export class Tab extends FrdyElement {
  static shadowRootOptions: ShadowRootInit = { ...FrdyElement.shadowRootOptions, delegatesFocus: true };
  static styles = css`
    :host {
      display: grid;
      border: 1px solid ${v.tab_border};
      border-block-start: none;
    }
  `;
  @property({ attribute: false })
  accessor layout: TabLayout | undefined;

  protected render() {
    return html`${choose(this.layout?.component.type, [
      ["files", () => html`<frdy-file-panel-tab .view=${this.layout!.component.view} .path=${this.layout!.path}></frdy-file-panel-tab>`],
    ])}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: Tab;
  }
}

// export const TabReact = createComponent({
//   tagName: TAG,
//   elementClass: Tab,
//   react: React,
// });
