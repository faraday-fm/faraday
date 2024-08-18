import clsx from "clsx";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { CursorStyle } from "./types";
import { consume } from "@lit/context";
import { isTouchScreenContext } from "../../../lit-contexts/IsTouchScreenProvider";

const TAG = "frdy-column-cell";

@customElement(TAG)
export class ColumnCell extends LitElement {
  static styles = css`
    :host {
      display: grid;
      overflow: hidden;
    }
    .cell {
      display: flex;
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
        background-color: var(--files-file-background-selected);
      }
      &.selected {
        background-color: var(--files-file-background-selected);
      }
    }
  `;

  @property({ attribute: true, type: Boolean, reflect: true })
  selected: boolean;

  @property({ type: String })
  cursorStyle: CursorStyle;

  @consume({ context: isTouchScreenContext, subscribe: true })
  isTouchscreen: boolean;

  constructor() {
    super();
    this.selected = false;
    this.cursorStyle = "firm";
    this.isTouchscreen = false;
  }

  private onPointerDown() {
    if (!this.isTouchscreen) {
      this.dispatchEvent(
        new CustomEvent("activate", {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private onOpen(isDoubleClick: boolean) {
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
        class=${clsx("cell", this.cursorStyle !== 'hidden' && `${this.cursorStyle}-cursor`, this.selected && "selected")}
        @pointerdown=${this.onPointerDown}
        @click=${() => this.onOpen(false)}
        @doubleclick=${() => this.onOpen(true)}
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
