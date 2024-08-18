import { createComponent } from "@lit/react";
import { LitElement, type PropertyValues, type TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { range } from "lit/directives/range.js";
import { map } from "lit/directives/map.js";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import React from "react";
import "./ScrollableContainer";
import { clamp } from "../../../utils/number";
import { consume } from "@lit/context";
import { glyphSizeContext } from "../../../lit-contexts/GlyphSizeProvider";

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
      border-inline-end: 1px solid var(--panel-border);
      &:last-child {
        border-inline-end: none;
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
  minColumnWidth?: number;

  @property({ type: Number })
  itemsCount: number;

  @property({ type: Number })
  lineHeight: number;

  @property({ attribute: false })
  renderItem?: (index: number, isActive: boolean) => TemplateResult<1>;

  @consume({ context: glyphSizeContext, subscribe: true })
  glyph?: { w: number; h: number };

  private _rootRef: Ref<HTMLInputElement> = createRef();
  private _fixedRef: Ref<HTMLInputElement> = createRef();
  private _observer: ResizeObserver;

  constructor() {
    super();
    this.topmostIndex = 0;
    this.activeIndex = 0;
    this.itemsCount = 0;
    this.lineHeight = 1;
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

  private _getItemHeight() {
    return (this.glyph?.h ?? 16) * this.lineHeight;
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    if (_changedProperties.has("glyph")) {
      console.error("***")
    }
    if (_changedProperties.has("glyph") || _changedProperties.has("lineHeight") || _changedProperties.has("minColumnWidth")) {
      this._updateDimentions();
    }
    if (_changedProperties.has("activeIndex") || _changedProperties.has("lineHeight") || _changedProperties.has("glyph")) {
      this._scrollTop = this.activeIndex * this._getItemHeight();
    }
  }

  private _updateDimentions = () => {
    const { clientWidth, clientHeight } = this;

    this._columnCount = this.minColumnWidth != null ? Math.max(1, Math.floor(clientWidth / this.minColumnWidth)) : 1;

    const itemsPerColumn = Math.max(1, Math.floor(clientHeight / this._getItemHeight()));

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
    this._updateActiveIndex(this.activeIndex, false);
  };

  private _onScroll(e: CustomEvent) {
    const scrollTop = e.detail.top as number;
    this._scrollTop = scrollTop;
    const newActiveIndex = Math.round(scrollTop / this._getItemHeight());
    if (newActiveIndex !== this.activeIndex) {
      this._updateActiveIndex(newActiveIndex, true);
    }
  }

  private _onActivate(e: CustomEvent, index: number) {
    e.stopPropagation();
    this._scrollTop = index * this._getItemHeight();
    this._updateActiveIndex(index, false);
  }

  private _updateActiveIndex = (newActiveIndex: number, shiftTop: boolean) => {
    const oldActiveIndex = this.activeIndex;
    this.activeIndex = clamp(0, newActiveIndex, this.itemsCount - 1);
    if (shiftTop) {
      const delta = this.activeIndex - oldActiveIndex;
      this.topmostIndex += delta;
    }
    const itemsVisible = this._columnCount * this._itemsPerColumn;
    this.topmostIndex = clamp(this.activeIndex - itemsVisible + 1, this.topmostIndex, this.activeIndex);
    this.topmostIndex = clamp(0, this.topmostIndex, this.itemsCount - itemsVisible);
    if (oldActiveIndex !== this.activeIndex) {
      this._fireActiveIndexChange(this.activeIndex);
    }
  };

  private _fireActiveIndexChange(activeIndex: number) {
    this.dispatchEvent(new CustomEvent("active-index-change", { detail: { activeIndex }, bubbles: true, composed: true }));
  }

  protected render() {
    return html`
      <div class="columns-scroller" ref=${ref(this._rootRef)} style="display: grid">
        <frdy-scrollable .fullScrollHeight=${(this.itemsCount - 1) * this._getItemHeight()} .fullScrollTop=${this._scrollTop} @scroll=${this._onScroll}>
          <div
            class="columns-scroller-fixed"
            ref=${ref(this._fixedRef)}
            style="display: grid; grid-template-columns: ${`repeat(${this._columnCount}, 1fr)`}; overflow: hidden"
          >
            ${map(
              range(this._columnCount),
              (column) => html`<div class="column-border">
                ${repeat(
                  range(
                    Math.min(this.topmostIndex + column * this._itemsPerColumn, this.itemsCount),
                    Math.min(this.topmostIndex + column * this._itemsPerColumn + this._itemsPerColumn, this.itemsCount)
                  ),
                  (i) => i,
                  (i) =>
                    html`<div
                      class="item"
                      style="height:${this._getItemHeight()}px;"
                      @activate=${(e: CustomEvent) => this._onActivate(e, i)}
                      @open=${(e: CustomEvent) => {
                        this.dispatchEvent(new CustomEvent("open", { detail: { index: i } }));
                        e.stopPropagation();
                      }}
                    >
                      ${this.renderItem?.(i, this.activeIndex === i)}
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
