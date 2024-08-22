import clsx from "clsx";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CursorStyle } from "./types";

const TAG = "frdy-column-cell";

@customElement(TAG)
export class ColumnCell extends LitElement {
  static styles = css`
    :host {
      display: grid;
      overflow: hidden;
    }
    .cell {
      display: grid;
      align-items: center;
      cursor: default;
      overflow: hidden;
      box-sizing: border-box;
      padding: 0 2px;
      border-radius: 2px;
      border: 1px solid transparent;
      &.firm-cursor {
        background-color: var(--files-file-background-focus);
        border: 1px solid var(--files-file-border-focus);
      }
      &.inactive-cursor {
        background-color: var(--files-file-background-focus);
      }
      &.selected {
        background-color: var(--files-file-background-selected);
      }
    }
  `;

  @property({ attribute: true, type: Boolean, reflect: true })
  accessor selected: boolean;

  @property({ type: String })
  accessor cursorStyle: CursorStyle;

  @property({ type: Boolean })
  accessor isTouchscreen: boolean;

  constructor() {
    super();
    this.selected = false;
    this.cursorStyle = "firm";
    this.isTouchscreen = false;
  }

  #onPointerDown(e: PointerEvent) {
    if (!this.isTouchscreen) {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("activate", {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  #onOpen(isDoubleClick: boolean) {
    if (this.isTouchscreen && !isDoubleClick) {
      this.dispatchEvent(
        new CustomEvent("open", {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  protected render() {
    return html`
      <div
        draggable="true"
        class=${clsx("cell", this.cursorStyle !== "hidden" && `${this.cursorStyle}-cursor`, this.selected && "selected")}
        @pointerdown=${this.#onPointerDown}
        @click=${() => this.#onOpen(false)}
        @doubleclick=${() => this.#onOpen(true)}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: ColumnCell;
  }
}
