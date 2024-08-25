import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { FrdyElement } from "./FrdyElement";
import { badge_background, badge_foreground, button_background, button_foreground } from "../css";

const TAG = "frdy-action-button";

@customElement(TAG)
export class ActionButton extends FrdyElement {
  static styles = css`
    :host {
      display: contents;
    }
    .actionButton {
      display: flex;
      flex-wrap: nowrap;
      align-items: stretch;
      &:last-child {
        padding-right: 0;
      }
    }
    .fnKeyClass {
      color: ${badge_foreground};
      background-color: ${badge_background};
    }
    .headerButton {
      text-align: left;
      width: 100%;
      color: ${button_foreground};
      background-color: ${button_background};
      padding: 0;
      cursor: pointer;
    }
  `;

  @property()
  accessor fnKey: string = "";

  @property()
  accessor header: string = "";

  protected render() {
    return html`
      <span class="actionButton" @pointerdown=${(e: PointerEvent) => e.preventDefault()}>
        <span class="fnKeyClass">${this.fnKey}</span>
        <div class="headerButton">${this.header}</div>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: ActionButton;
  }
}

// export const ActionButtonReact = createComponent({
//   tagName: TAG,
//   elementClass: ActionButton,
//   react: React,
// });
