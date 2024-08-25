import { CommandsContext, commandsContext } from "@frdy/commands";
import { consume } from "@lit/context";
import clsx from "clsx";
import { PropertyValues, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { FrdyElement } from "../../FrdyElement";
import type { CursorStyle } from "./types";
import { focusBorder, list_focusBackground, list_focusOutline, list_inactiveSelectionBackground } from "../../../css";

const TAG = "frdy-column-cell";

const doubleClickThreshold = 300; // ms

@customElement(TAG)
export class ColumnCell extends FrdyElement {
  static styles = css`
    :host {
      display: grid;
      overflow: hidden;
      padding-inline-end: 1px;
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
      cursor: default;
      overflow: hidden;
      padding: 0 2px;
      border: 1px solid transparent;
      &.inactive-cursor {
        background-color: ${list_inactiveSelectionBackground};
        background-color: color-mix(in srgb, ${focusBorder}, transparent 70%);
      }
      &.selected {
        background-color: ${list_focusBackground};
        border-radius: 0;
      }
      &.firm-cursor {
        background-color: ${list_focusBackground};
        border: 1px solid ${list_focusOutline};
        border-radius: 4px;
      }
    }
  `;

  @consume({ context: commandsContext })
  accessor commands!: CommandsContext;

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

  // #onPointerDown(e: PointerEvent) {
  //   console.error("**",isDoubleClick);
  //   // if (this.isTouchscreen && !isDoubleClick || isDoubleClick) {
  //   //   this.commands.invokeCommand("open",);
  //   //   this.dispatchEvent(
  //   //     new CustomEvent("open", {
  //   //       bubbles: true,
  //   //       composed: true,
  //   //     })
  //   //   );
  //   // }
  // }

  protected render() {
    return html`
      <div
        class=${clsx("cell", this.cursorStyle !== "hidden" && `${this.cursorStyle}-cursor`, this.selected && "selected")}
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
