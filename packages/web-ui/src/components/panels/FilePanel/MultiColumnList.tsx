import { command } from "@frdy/commands";
import { consume } from "@lit/context";
import { LitElement, type PropertyValues, type TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { range } from "lit/directives/range.js";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { glyphSizeContext } from "../../../lit-contexts/GlyphSizeProvider";
import { clamp } from "../../../utils/number";
import "./ScrollableContainer";
import { FrdyElement } from "../../FrdyElement";

const TAG = "frdy-multicolumn-list";

export class MeasureChangeEvent extends Event {
  constructor(public readonly columnCount: number, public readonly itemsPerColumn: number) {
    super("measure-change", { bubbles: true, composed: true });
  }
}

@customElement(TAG)
export class MultiColumnList extends FrdyElement {
  static shadowRootOptions: ShadowRootInit = { ...FrdyElement.shadowRootOptions, delegatesFocus: true };
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
      box-sizing: border-box;
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
    const shiftTop = this.far && this.activeIndex < this.topmostIndex + this.#itemsPerColumn;
    this.#updateActiveIndex(this.activeIndex - this.#itemsPerColumn, shiftTop);
  }

  @command({ whenFocusWithin: true })
  cursorRight() {
    const shiftTop = this.far && this.activeIndex >= this.topmostIndex + this.#itemsPerColumn * (this.#columnCount - 1);
    this.#updateActiveIndex(this.activeIndex + this.#itemsPerColumn, shiftTop);
  }

  @command({ whenFocusWithin: true })
  cursorUp() {
    this.#updateActiveIndex(this.activeIndex - 1, false);
  }

  @command({ whenFocusWithin: true })
  cursorDown() {
    this.#updateActiveIndex(this.activeIndex + 1, false);
  }

  @command({ whenFocusWithin: true })
  cursorPageUp() {
    this.#updateActiveIndex(this.activeIndex - this.#itemsPerColumn * this.#columnCount + 1, this.far);
  }

  @command({ whenFocusWithin: true })
  cursorPageDown() {
    this.#updateActiveIndex(this.activeIndex + this.#itemsPerColumn * this.#columnCount - 1, this.far);
  }

  @command({ whenFocusWithin: true })
  cursorStart() {
    this.#updateActiveIndex(0, false);
  }

  @command({ whenFocusWithin: true })
  cursorEnd() {
    this.#updateActiveIndex(this.itemsCount - 1, false);
  }

  #rootRef: Ref<HTMLInputElement> = createRef();
  #fixedRef: Ref<HTMLInputElement> = createRef();
  #observer: ResizeObserver;

  constructor() {
    super();
    this.activeIndex = 0;
    this.itemsCount = 0;
    this.lineHeight = 1;
    this.#observer = new ResizeObserver(this.#updateDimensions);
  }

  @state()
  accessor #scrollTop = 0;

  @state()
  accessor #itemsPerColumn = 10;

  @state()
  accessor #columnCount = 1;

  connectedCallback() {
    super.connectedCallback();
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    this.#observer.unobserve(this);
    super.disconnectedCallback();
  }

  #getItemHeight() {
    return (this.glyph?.h ?? 16) * this.lineHeight;
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("glyph") || _changedProperties.has("lineHeight") || _changedProperties.has("minColumnWidth")) {
      this.#updateDimensions();
    }
    if (_changedProperties.has("activeIndex") || _changedProperties.has("lineHeight") || _changedProperties.has("glyph")) {
      this.#scrollTop = this.activeIndex * this.#getItemHeight();
    }
    super.willUpdate(_changedProperties);
  }

  #updateDimensions = () => {
    const { width, height } = this.getBoundingClientRect();
    const oldColumnCount = this.#columnCount;
    const columnCount = this.minColumnWidth != null ? Math.max(1, Math.floor(width / this.minColumnWidth)) : 1;
    const itemsPerColumn = Math.max(1, Math.floor(height / this.#getItemHeight()));

    if (this.#itemsPerColumn !== itemsPerColumn || oldColumnCount) {
      this.#columnCount = columnCount;
      this.#itemsPerColumn = itemsPerColumn;
      this.dispatchEvent(new MeasureChangeEvent(columnCount, itemsPerColumn));
    }
    this.#updateActiveIndex(this.activeIndex, false);
  };

  #onScroll(e: CustomEvent) {
    const scrollTop = e.detail.top as number;
    this.#scrollTop = scrollTop;
    const newActiveIndex = Math.round(scrollTop / this.#getItemHeight());
    if (newActiveIndex !== this.activeIndex) {
      this.#updateActiveIndex(newActiveIndex, this.far);
    }
  }

  #onActivate(e: CustomEvent, index: number) {
    e.stopPropagation();
    this.#scrollTop = index * this.#getItemHeight();
    this.#updateActiveIndex(index, false);
  }

  #updateActiveIndex = (newActiveIndex: number, shiftTop: boolean) => {
    const oldActiveIndex = this.activeIndex;
    newActiveIndex = clamp(0, newActiveIndex, this.itemsCount - 1);
    let newTopmostIndex = this.topmostIndex;
    if (shiftTop) {
      const delta = newActiveIndex - oldActiveIndex;
      newTopmostIndex += delta;
    }
    const itemsVisible = this.#columnCount * this.#itemsPerColumn;
    newTopmostIndex = clamp(newActiveIndex - itemsVisible + 1, newTopmostIndex, newActiveIndex);
    newTopmostIndex = clamp(0, newTopmostIndex, this.itemsCount - itemsVisible);
    if (oldActiveIndex !== newActiveIndex || this.topmostIndex !== newTopmostIndex) {
      this.topmostIndex = newTopmostIndex;
      this.activeIndex = newActiveIndex;
      this.#fireActiveIndexChange(newTopmostIndex, newActiveIndex);
    }
  };

  #fireActiveIndexChange(topmostIndex: number, activeIndex: number) {
    this.dispatchEvent(new CustomEvent("active-index-change", { detail: { topmostIndex, activeIndex }, bubbles: true, composed: true }));
  }

  #onPointerDown(e: PointerEvent) {
    // If user clicks of empty space beneath the last file, activate it.
    const fullyPopulatedColumnCount = Math.floor((this.itemsCount - this.topmostIndex) / this.#itemsPerColumn);
    if (e.offsetX >= (this.getBoundingClientRect().width * fullyPopulatedColumnCount) / this.#columnCount) {
      this.#updateActiveIndex(this.itemsCount - 1, false);
    }
  }

  protected render() {
    const emptyColumns = this.#columnCount - Math.ceil((this.itemsCount - this.topmostIndex) / this.#itemsPerColumn);

    return html`
      <frdy-scrollable
        tabindex="0"
        class="columns-scroller"
        aria-colcount=${this.#columnCount}
        ref=${ref(this.#rootRef)}
        .fullScrollHeight=${(this.itemsCount - 1) * this.#getItemHeight()}
        .fullScrollTop=${this.#scrollTop}
        @scroll=${this.#onScroll}
      >
        <div style="display:grid;position:absolute;inset:0;grid-template-columns: repeat(${this.#columnCount}, 1fr)">
          ${map(range(this.#columnCount), (i) => html`<div style=${i < this.#columnCount - 1 && "border-inline-end: 1px solid var(--panel-border);"}></div>`)}
        </div>

        <div class="columns-scroller-fixed" ref=${ref(this.#fixedRef)} @pointerdown=${this.#onPointerDown}>
          ${repeat(
            range(this.topmostIndex, Math.min(this.itemsCount, this.topmostIndex + this.#columnCount * this.#itemsPerColumn)),
            (i) => i,
            (i) =>
              html`<div
                class="item"
                style="width:${100 / this.#columnCount}%;height:${this.#getItemHeight()}px"
                @activate=${(e: CustomEvent) => this.#onActivate(e, i)}
                @open=${(e: CustomEvent) => {
                  this.dispatchEvent(new CustomEvent("open", { detail: { index: i } }));
                  e.stopPropagation();
                }}
              >
                ${this.renderItem?.(i, this.activeIndex === i)}
              </div>`
          )}
          ${map(range(emptyColumns), () => html`<div style="height:100%;width:${100 / this.#columnCount}%" }></div>`)}
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
