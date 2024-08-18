import { ContextProvider, createContext } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

const TAG = "frdy-glyph-size-provider";

export const glyphSizeContext = createContext<{ w: number; h: number }>(Symbol("glyph-size"));

@customElement(TAG)
export class GlyphSizeProvider extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    .w {
      position: absolute;
      opacity: 0;
      user-select: none;
      pointer-events: none;
      left: -1000px;
      top: -1000px;
    }
  `;

  @query("#w", true)
  w!: HTMLDivElement;

  private _glyphSizeProvider = new ContextProvider(this, { context: glyphSizeContext, initialValue: { w: 8, h: 16 } });
  private _observer = new ResizeObserver(() => {
    this._glyphSizeProvider.setValue({ w: this.w.clientWidth, h: this.w.clientHeight });
  });

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer.unobserve(this.w);
  }

  firstUpdated() {
    this._glyphSizeProvider.setValue({ w: this.w.clientWidth, h: this.w.clientHeight });
    this._observer.observe(this.w);
  }

  protected render() {
    return html`
      <div id="w" aria-hidden="true" class="w">W</div>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: GlyphSizeProvider;
  }
}
