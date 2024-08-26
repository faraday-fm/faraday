import { CommandsContext, commandsContext } from "@frdy/commands";
import { consume } from "@lit/context";
import clsx from "clsx";
import { PropertyValues, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import * as v from "../../../css";
import { FrdyElement } from "../../FrdyElement";
import type { CursorStyle } from "./types";

const TAG = "frdy-column-cell";

const doubleClickThreshold = 300; // ms

@customElement(TAG)
export class ColumnCell extends FrdyElement {
  static styles = css`
    :host {
      position: relative;
      display: grid;
      overflow: hidden;
      margin-inline: 4px 5px;
    }
    :host(:focus-visible) {
      outline: none;
    }
    .cell {
      &:focus,
      &:focus-visible {
        outline: none;
      }
      display: grid;
      align-items: center;
      /* cursor: default; */
      overflow: hidden;
      padding: 0 2px;
      border: 1px solid transparent;
      &.inactive-cursor {
        background-color: ${v.list_inactiveSelectionBackground};
        background-color: color-mix(in srgb, ${v.focusBorder}, transparent 70%);
        border: 1px solid ${v.list_inactiveFocusOutline};
      }
      &.selected {
        color: ${v.list_activeSelectionForeground};
        background-color: ${v.list_activeSelectionBackground};
        border-radius: 5px;
      }
      &.merge-prev {
        border-start-start-radius: 0px;
        border-start-end-radius: 0px;
      }
      &.merge-next {
        border-end-start-radius: 0px;
        border-end-end-radius: 0px;
      }
      &.firm-cursor:after {
        content: "";
        position: absolute;
        inset: 0;
        color: ${v.list_activeSelectionForeground};
        border: 1px solid ${v.list_focusOutline};
        border-radius: 5px;
      }
    }
  `;

  @consume({ context: commandsContext })
  accessor commands!: CommandsContext;

  @property({ type: Boolean })
  accessor selected = false;

  @property({ type: Boolean })
  accessor prevSiblingSelected = false;

  @property({ type: Boolean })
  accessor nextSiblingSelected = false;

  @property({ type: String })
  accessor cursorStyle: CursorStyle;

  @property({ type: Boolean })
  accessor isTouchscreen: boolean;

  constructor() {
    super();
    this.cursorStyle = "firm";
    this.isTouchscreen = false;
  }

  protected update(_changedProperties: PropertyValues): void {
    super.update(_changedProperties);
    // HACK for safari. tabindex=0 for the whole panel makes scrolling very slow. Thus, we have to set tabindex=0 on each cell and track active item.
    if (this.cursorStyle === "firm") {
      this.focus();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.draggable = true;
    this.tabIndex = 0;
  }

  #lastClickTime = 0;

  #onPointerDown(e: PointerEvent) {
    const currentTime = performance.now();

    let isDoubleClick = false;
    if (currentTime - this.#lastClickTime < doubleClickThreshold) {
      isDoubleClick = true;
      this.#lastClickTime = 0;
    } else {
      this.#lastClickTime = currentTime;
    }

    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("activate", {
        bubbles: true,
        composed: true,
      })
    );

    if (isDoubleClick || this.isTouchscreen) {
      this.commands.invokeCommand("open", undefined, e.composedPath());
    }
  }

  protected render() {
    return html`
      <div
        class=${clsx(
          "cell",
          this.prevSiblingSelected && "merge-prev",
          this.nextSiblingSelected && "merge-next",
          this.cursorStyle !== "hidden" && `${this.cursorStyle}-cursor`,
          this.selected && "selected"
        )}
        @pointerdown=${this.#onPointerDown}
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
