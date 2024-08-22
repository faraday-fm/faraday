import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import type { TabLayout } from "../../types";
import "./FilePanelTab";
import { FrdyElement } from "../FrdyElement";

const TAG = "frdy-tab";

@customElement(TAG)
export class Tab extends FrdyElement {
  static shadowRootOptions: ShadowRootInit = { ...FrdyElement.shadowRootOptions, delegatesFocus: true };
  static styles = css`
    :host {
      display: contents;
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
