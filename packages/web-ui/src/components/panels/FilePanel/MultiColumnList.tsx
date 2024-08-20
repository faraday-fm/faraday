import { command } from "@frdy/commands";
import { consume } from "@lit/context";
import { EventName, createComponent } from "@lit/react";
import { LitElement, type PropertyValues, type TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { range } from "lit/directives/range.js";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import React from "react";
import { glyphSizeContext } from "../../../lit-contexts/GlyphSizeProvider";
import { clamp } from "../../../utils/number";
import "./ScrollableContainer";
import { map } from "lit/directives/map.js";

const TAG = "frdy-multicolumn-list";

export class MeasureChangeEvent extends Event {
  constructor(public readonly columnCount: number, public readonly itemsPerColumn: number) {
    super("measure-change", { bubbles: true, composed: true });
  }
}

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
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
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

  @property({ type: Number, attribute: false })
  accessor topmostIndex = 0;

  @property({ type: Number, attribute: false })
  accessor activeIndex: number;

  @property({ type: Number })
  accessor minColumnWidth: number | undefined;

  @property({ type: Number })
  accessor itemsCount: number;

  @property({ type: Number })
  accessor lineHeight: number;

  @property({ attribute: false })
  accessor renderItem: ((index: number, isActive: boolean) => TemplateResult<1>) | undefined;

  @property({ type: Boolean })
  accessor far = false;

  @consume({ context: glyphSizeContext, subscribe: true })
  accessor glyph!: { w: number; h: number };

  @command({ whenFocusWithin: true })
  cursorLeft() {
    const shiftTop = this.far && this.activeIndex < this.topmostIndex + this._itemsPerColumn;
    this._updateActiveIndex(this.activeIndex - this._itemsPerColumn, shiftTop);
  }

  @command({ whenFocusWithin: true })
  cursorRight() {
    const shiftTop = this.far && this.activeIndex >= this.topmostIndex + this._itemsPerColumn * (this._columnCount - 1);
    this._updateActiveIndex(this.activeIndex + this._itemsPerColumn, shiftTop);
  }

  @command({ whenFocusWithin: true })
  cursorUp() {
    this._updateActiveIndex(this.activeIndex - 1, false);
  }

  @command({ whenFocusWithin: true })
  cursorDown() {
    this._updateActiveIndex(this.activeIndex + 1, false);
  }

  @command({ whenFocusWithin: true })
  cursorPageUp() {
    this._updateActiveIndex(this.activeIndex - this._itemsPerColumn * this._columnCount + 1, this.far);
  }

  @command({ whenFocusWithin: true })
  cursorPageDown() {
    this._updateActiveIndex(this.activeIndex + this._itemsPerColumn * this._columnCount - 1, this.far);
  }

  @command({ whenFocusWithin: true })
  cursorStart() {
    this._updateActiveIndex(0, false);
  }

  @command({ whenFocusWithin: true })
  cursorEnd() {
    this._updateActiveIndex(this.itemsCount - 1, false);
  }

  private _rootRef: Ref<HTMLInputElement> = createRef();
  private _fixedRef: Ref<HTMLInputElement> = createRef();
  private _observer: ResizeObserver;

  constructor() {
    super();
    this.activeIndex = 0;
    this.itemsCount = 0;
    this.lineHeight = 1;
    this._observer = new ResizeObserver(this._updateDimensions);
  }

  @state()
  private accessor _scrollTop = 0;

  @state()
  private accessor _itemsPerColumn = 10;

  @state()
  private accessor _columnCount = 1;

  connectedCallback() {
    super.connectedCallback();
    this._observer.observe(this);
  }

  disconnectedCallback() {
    this._observer.unobserve(this);
    super.disconnectedCallback();
  }

  private _getItemHeight() {
    return (this.glyph?.h ?? 16) * this.lineHeight;
  }

  protected update(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("glyph") || _changedProperties.has("lineHeight") || _changedProperties.has("minColumnWidth")) {
      this._updateDimensions();
    }
    if (_changedProperties.has("activeIndex") || _changedProperties.has("lineHeight") || _changedProperties.has("glyph")) {
      this._scrollTop = this.activeIndex * this._getItemHeight();
    }
    super.update(_changedProperties);
  }

  private _updateDimensions = () => {
    const { width, height } = this.getBoundingClientRect();
    const oldColumnCount = this._columnCount;
    const columnCount = this.minColumnWidth != null ? Math.max(1, Math.floor(width / this.minColumnWidth)) : 1;
    const itemsPerColumn = Math.max(1, Math.floor(height / this._getItemHeight()));

    if (this._itemsPerColumn !== itemsPerColumn || oldColumnCount) {
      this._columnCount = columnCount;
      this._itemsPerColumn = itemsPerColumn;
      this.dispatchEvent(new MeasureChangeEvent(columnCount, itemsPerColumn));
    }
    this._updateActiveIndex(this.activeIndex, false);
  };

  private _onScroll(e: CustomEvent) {
    const scrollTop = e.detail.top as number;
    this._scrollTop = scrollTop;
    const newActiveIndex = Math.round(scrollTop / this._getItemHeight());
    if (newActiveIndex !== this.activeIndex) {
      this._updateActiveIndex(newActiveIndex, this.far);
    }
  }

  private _onActivate(e: CustomEvent, index: number) {
    e.stopPropagation();
    this._scrollTop = index * this._getItemHeight();
    this._updateActiveIndex(index, false);
  }

  private _updateActiveIndex = (newActiveIndex: number, shiftTop: boolean) => {
    const oldActiveIndex = this.activeIndex;
    newActiveIndex = clamp(0, newActiveIndex, this.itemsCount - 1);
    let newTopmostIndex = this.topmostIndex;
    if (shiftTop) {
      const delta = newActiveIndex - oldActiveIndex;
      newTopmostIndex += delta;
    }
    const itemsVisible = this._columnCount * this._itemsPerColumn;
    newTopmostIndex = clamp(newActiveIndex - itemsVisible + 1, newTopmostIndex, newActiveIndex);
    newTopmostIndex = clamp(0, newTopmostIndex, this.itemsCount - itemsVisible);
    if (oldActiveIndex !== newActiveIndex || this.topmostIndex !== newTopmostIndex) {
      this.topmostIndex = newTopmostIndex;
      this.activeIndex = newActiveIndex;
      this._fireActiveIndexChange(newTopmostIndex, newActiveIndex);
    }
  };

  private _fireActiveIndexChange(topmostIndex: number, activeIndex: number) {
    this.dispatchEvent(new CustomEvent("active-index-change", { detail: { topmostIndex, activeIndex }, bubbles: true, composed: true }));
  }

  private _onPointerDown(e: PointerEvent) {
    // If user clicks of empty space beneath the last file, activate it.
    const fullyPopulatedColumnCount = Math.floor((this.itemsCount - this.topmostIndex) / this._itemsPerColumn);
    if (e.offsetX >= (this.getBoundingClientRect().width * fullyPopulatedColumnCount) / this._columnCount) {
      this._updateActiveIndex(this.itemsCount - 1, false);
    }
  }

  protected render() {
    const emptyColumns = this._columnCount - Math.ceil((this.itemsCount - this.topmostIndex) / this._itemsPerColumn);

    return html`
      <frdy-scrollable
        class="columns-scroller"
        ref=${ref(this._rootRef)}
        .fullScrollHeight=${(this.itemsCount - 1) * this._getItemHeight()}
        .fullScrollTop=${this._scrollTop}
        @scroll=${this._onScroll}
      >
        <div style="display:grid;position:absolute;inset:0;grid-template-columns: repeat(${this._columnCount}, 1fr)">
          ${map(range(this._columnCount), (i) => html`<div style=${i < this._columnCount - 1 && "border-inline-end: 1px solid var(--panel-border);"}></div>`)}
        </div>

        <div class="columns-scroller-fixed" ref=${ref(this._fixedRef)} @pointerdown=${this._onPointerDown}>
          ${repeat(
            range(this.topmostIndex, Math.min(this.itemsCount, this.topmostIndex + this._columnCount * this._itemsPerColumn)),
            (i) => i,
            (i) =>
              html`<div
                class="item"
                style="width:${100 / this._columnCount}%;height:${this._getItemHeight()}px;overflow:hidden"
                @activate=${(e: CustomEvent) => this._onActivate(e, i)}
                @open=${(e: CustomEvent) => {
                  this.dispatchEvent(new CustomEvent("open", { detail: { index: i } }));
                  e.stopPropagation();
                }}
              >
                ${this.renderItem?.(i, this.activeIndex === i)}
              </div>`
          )}
          ${map(range(emptyColumns), () => html`<div style="height:100%;width:${100 / this._columnCount}%" }></div>`)}
        </div>
      </frdy-scrollable>
    `;
  }
}

/*

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

*/

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
    onActiveIndexChange: "active-index-change" as EventName<CustomEvent<{ activeIndex: number }>>,
    onMeasureChange: "measure-change" as EventName<MeasureChangeEvent>,
  },
});
