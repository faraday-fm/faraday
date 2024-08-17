import { createComponent } from "@lit/react";
import { LitElement, type PropertyValues, type TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { range } from "lit/directives/range.js";
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
  minColumnWidth: number;

  @property({ type: Number })
  itemsCount: number;

  @property({ type: Number })
  itemHeight: number;

  @property({ attribute: false })
  renderItem?: (index: number) => TemplateResult<1>;

  private _rootRef: Ref<HTMLInputElement> = createRef();
  private _fixedRef: Ref<HTMLInputElement> = createRef();
  private _observer: ResizeObserver;

  constructor() {
    super();
    this.topmostIndex = 0;
    this.activeIndex = 0;
    this.minColumnWidth = 350;
    this.itemsCount = 0;
    this.itemHeight = 20;
    this._observer = new ResizeObserver(this._updateDimentions);
  }

  @state()
  private _scrollTop = 0;

  @state()
  private _itemsPerColumn = 10;

  @state()
  private _columnCount = 1;

  connectedCallback() {
    super.connectedCallback();
    this._observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._observer.unobserve(this);
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    if (_changedProperties.has("itemHeight") || _changedProperties.has("minColumnWidth")) {
      this._updateDimentions();
    }
    if (_changedProperties.has("activeIndex") || _changedProperties.has("itemHeight")) {
      this._scrollTop = this.activeIndex * this.itemHeight;
    }
  }

  private _updateDimentions = () => {
    const { clientWidth, clientHeight } = this;

    this._columnCount = Math.max(1, Math.floor(clientWidth / this.minColumnWidth));

    const itemsPerColumn = Math.max(1, Math.floor(clientHeight / this.itemHeight));

    if (this._itemsPerColumn !== itemsPerColumn) {
      this._itemsPerColumn = itemsPerColumn;
      this.dispatchEvent(
        new CustomEvent("items-per-column-change", {
          detail: {
            itemsPerColumn,
          },
          bubbles: true,
          composed: true,
        })
      );
    }
  };

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
    const items = Array.from(range(this.topmostIndex, this.topmostIndex + Math.min(this.itemsCount, this._columnCount * this._itemsPerColumn)));
    const columnItems: (typeof items)[] = [];
    const slice = (column: number) => items.slice(column * this._itemsPerColumn, (column + 1) * this._itemsPerColumn);
    for (let i = 0; i < this._columnCount; i++) {
      columnItems[i] = slice(i);
    }

    return html`
      <div class="columns-scroller" ref=${ref(this._rootRef)} style="display: grid">
        <frdy-scrollable .fullScrollHeight=${(this.itemsCount - 1) * this.itemHeight} .fullScrollTop=${this._scrollTop} @scroll=${this.onScroll}>
          <div
            class="columns-scroller-fixed"
            ref=${ref(this._fixedRef)}
            style="display: grid; grid-template-columns: ${`repeat(${this._columnCount}, 1fr)`}; overflow: hidden"
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
    onItemsPerColumnChange: "items-per-column-change",
  },
});
