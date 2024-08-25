import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { FrdyElement } from "./FrdyElement";

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
      color: var(--badge-foreground);
      background-color: var(--badge-background);
    }
    .headerButton {
      text-align: left;
      width: 100%;
      background-color: var(--button-background);
      color: var(--button-foreground);
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
