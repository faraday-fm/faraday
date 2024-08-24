import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "./ActionButton";
import { FrdyElement } from "./FrdyElement";

const TAG = "frdy-action-bar";

@customElement(TAG)
export class ActionBar extends FrdyElement {
  static styles = css`
    :host {
      display: contents;
    }
    .actionsBar {
      display: grid;
      gap: 1ch;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      overflow: hidden;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
    }
  `;

  protected render() {
    return html`
      <div class="actionsBar" tabindex="-1">
        <frdy-action-button fnKey="1" header="Help"></frdy-action-button>
        <frdy-action-button fnKey="2" header="Menu"></frdy-action-button>
        <frdy-action-button fnKey="3" header="View"></frdy-action-button>
        <frdy-action-button fnKey="4" header="Edit"></frdy-action-button>
        <frdy-action-button fnKey="5" header="Copy"></frdy-action-button>
        <frdy-action-button fnKey="6" header="RenMov"></frdy-action-button>
        <frdy-action-button fnKey="7" header="Mkdir"></frdy-action-button>
        <frdy-action-button fnKey="8" header="Delete"></frdy-action-button>
        <frdy-action-button fnKey="9" header="ConfMn"></frdy-action-button>
        <frdy-action-button fnKey="10" header="Quit"></frdy-action-button>
        <frdy-action-button fnKey="11" header="Plugins"></frdy-action-button>
        <frdy-action-button fnKey="12" header="Screens"></frdy-action-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: ActionBar;
  }
}

// export const ActionBarReact = createComponent({
//   tagName: TAG,
//   elementClass: ActionBar,
//   react: React,
// });
