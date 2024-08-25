import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { FrdyElement } from "../../../FrdyElement";
import { fontFamily } from "../../../../css";

const TAG = "frdy-drag-ghost";

@customElement(TAG)
export class DragGhost extends FrdyElement {
  static styles = css`
    :host {
      position: absolute;
      top: -10000px;
    }
    .host {
      /* zoom: 0.8; */
      font-family: ${fontFamily};
      color: var(--files-file-foreground);
      background-color: var(--files-file-background-selected);
      overflow: hidden;
      height: 200px;
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
    }
  `;

  protected render(): unknown {
    return html`<div class="host"><slot></slot></div>`;
  }
}
