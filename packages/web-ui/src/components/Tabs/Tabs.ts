import clsx from "clsx";
import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { TabSetLayout } from "../../types";
import { FrdyElement } from "../FrdyElement";
import "./Tab";
import { panel_border, tab_activeBackground, tab_activeForeground, tab_border, tab_hoverBackground, tab_inactiveBackground, tab_inactiveForeground } from "../../css";

const TAG = "frdy-tabs";

@customElement(TAG)
export class Tabs extends FrdyElement {
  static styles = css`
    :host {
      box-sizing: border-box;
      overflow: hidden;
      width: 100%;
      height: 100%;
      border: 1px solid ${panel_border};
      display: grid;
      grid-template-rows: auto 1fr;
    }
    .header {
      display: flex;
      color: ${tab_inactiveForeground};
      background-color: ${tab_inactiveBackground};
      overflow: hidden;
      box-shadow: inset 0 0 0 1px ${tab_border};
    }
    .tabName {
      cursor: pointer;
      min-width: fit-content;
      padding-inline: 2ch;
      line-height: 35px;
      white-space: nowrap;
      border-inline: 1px solid ${tab_border};
      border-inline-start: none;
      &:hover {
        color: ${tab_activeForeground};
        background-color: ${tab_activeBackground};
      }
      &.-active {
        color: ${tab_activeForeground};
        background-color: ${tab_activeBackground};
      }
    }
  `;

  @property({ attribute: false })
  accessor layout: TabSetLayout | undefined;

  @property({ attribute: false })
  accessor setLayout: ((newLayout: TabSetLayout) => void) | undefined;

  #tabRef = createRef<HTMLElement>();

  protected render() {
    if (!this.layout) {
      return nothing;
    }

    return html`
      <div class="header">
        ${repeat(
          this.layout.children,
          (tab) => tab.id,
          (tab) => html`<div class=${clsx("tabName", this.layout?.activeTabId === tab.id && "-active")} @click=${() => this.#tabRef.value?.focus()}>
            ${tab.name}
          </div>`
        )}
      </div>
      <frdy-tab ref=${ref(this.#tabRef)} .layout=${this.layout!.children[0]}></frdy-tab>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: Tabs;
  }
}

// export const TabsReact = createComponent({
//   tagName: TAG,
//   elementClass: Tabs,
//   react: React,
// });
