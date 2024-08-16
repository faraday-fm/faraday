import { createComponent } from "@lit/react";
import { LitElement, type PropertyValues, type TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import React from "react";
import "./ScrollableContainer";

const TAG = "frdy-multicolumn-list";

@customElement(TAG)
export class MultiColumnList extends LitElement {
  static styles = css`
    :host {
      display: grid;
    }
    .columns-scroller {
      position: relative;
      display: grid;
      overflow: hidden;
    }
    .columns-scroller-fixed {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    .column-border {
      overflow: hidden;
      border-right: 1px solid var(--panel-border);
      &:last-child {
        border-right-width: 0;
      }
    }
    .item {
      display: grid;
      overflow: hidden;
      box-sizing: border-box˝;
    }
  `;

  @property({ type: Number })
  topmostIndex: number;

  @property({ type: Number })
  activeIndex: number;

  @property({ type: Number })
  columnCount: number;

  @property({ type: Number })
  itemsCount: number;

  @property({ type: Number })
  itemHeight: number;

  @property({ type: Boolean })
  isTouchscreen: boolean;

  @property({ attribute: false })
  renderItem?: (index: number) => TemplateResult;

  constructor() {
    super();
    this.topmostIndex = 0;
    this.activeIndex = 0;
    this.columnCount = 1;
    this.itemsCount = 0;
    this.itemHeight = 27;
    this.isTouchscreen = false;
  }

  private _rootRef: Ref<HTMLInputElement> = createRef();
  private _fixedRef: Ref<HTMLInputElement> = createRef();

  @state()
  private _scrollTop = 0;

  @state()
  private _maxItemsPerColumn = 10;

  private _observer?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    this._updateMaxItemsPerColumn();
    const observer = new ResizeObserver(() => this._updateMaxItemsPerColumn());
    observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    if (_changedProperties.has("itemHeight")) {
      this._updateMaxItemsPerColumn();
    }
  }

  private _updateMaxItemsPerColumn() {
    const height = this.clientHeight;
    const maxItemsPerColumn = Math.max(1, Math.floor(height / this.itemHeight));

    if (this._maxItemsPerColumn !== maxItemsPerColumn) {
      this._maxItemsPerColumn = maxItemsPerColumn;
      this.dispatchEvent(
        new CustomEvent("max-items-per-column-change", {
          detail: {
            maxItemsPerColumn,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private onScroll(e: CustomEvent) {
    const scrollTop = e.detail.top as number;
    this._scrollTop = scrollTop;
    const newActiveIndex = Math.round(scrollTop / this.itemHeight);
    if (newActiveIndex !== this.activeIndex) {
      this._fireActiveIndexChange(newActiveIndex, "scroll");
    }
  }

  private onActivate(e: CustomEvent, index: number) {
    e.stopPropagation();
    this._scrollTop = index * this.itemHeight;
    this._fireActiveIndexChange(index, "click");
  }

  private _fireActiveIndexChange(activeIndex: number, initiator: string) {
    this.dispatchEvent(new CustomEvent("active-index-change", { detail: { activeIndex, initiator }, bubbles: true, composed: true }));
  }

  protected render() {
    const items: number[] = [];
    for (let i = this.topmostIndex; i < this.topmostIndex + Math.min(this.itemsCount, this.columnCount * this._maxItemsPerColumn); i++) {
      items.push(i);
    }
    const columnItems: (typeof items)[] = [];
    const slice = (column: number) => items.slice(column * this._maxItemsPerColumn, (column + 1) * this._maxItemsPerColumn);
    for (let i = 0; i < this.columnCount; i++) {
      columnItems[i] = slice(i);
    }

    return html`
      <div class="columns-scroller" ref=${ref(this._rootRef)} style="display: grid">
        <frdy-scrollable
          .fullScrollHeight=${(this.itemsCount - 1) * this.itemHeight}
          .fullScrollTop=${this._scrollTop}
          .isTouchscreen=${this.isTouchscreen}
          @scroll=${this.onScroll}
        >
          <div
            class="columns-scroller-fixed"
            ref=${ref(this._fixedRef)}
            style="display: grid; grid-template-columns: ${`repeat(${this.columnCount}, 1fr)`}; overflow: hidden"
          >
            ${columnItems.map(
              (items) => html`<div class="column-border">
                ${repeat(
                  items,
                  (i) => i,
                  (i) =>
                    html`<div
                      class="item"
                      style="height:${this.itemHeight}px;"
                      @activate=${(e: CustomEvent) => this.onActivate(e, i)}
                      @open=${(e: CustomEvent) => {
                        this.dispatchEvent(new CustomEvent("open", { detail: { index: i } }));
                        e.stopPropagation();
                      }}
                    >
                      ${this.renderItem?.(i)}
                    </div>`
                )}
              </div>`
            )}
          </div>
        </frdy-scrollable>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: MultiColumnList;
  }
}

export const MultiColumnListReact = createComponent({
  tagName: TAG,
  elementClass: MultiColumnList,
  react: React,
  events: {
    onActiveIndexChange: "active-index-change",
    onMaxItemsPerColumnChange: "max-items-per-column-change",
  },
});
