import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import type { RowLayout } from "../../types";
import { FrdyElement } from "../FrdyElement";
import "./Tabs";

const TAG = "frdy-separator";

@customElement(TAG)
export class Separator extends FrdyElement {
  static styles = css`
    :host {
      position: relative;
      z-index: 1;
    }
    .thumb {
      position: absolute;
      inset: -2px;
    }
  `;

  @property({ attribute: false })
  accessor layout: RowLayout | undefined;

  @property({ attribute: false })
  accessor setLayout: ((layout: RowLayout) => void) | undefined;

  @property()
  accessor direction: "h" | "v" = "h";

  @property({ type: Number })
  accessor index = 0;

  @property({ attribute: false })
  accessor items: Ref<HTMLDivElement>[] = [];

  #thumbRef = createRef();
  // #pointerDownCoords: { x: number; y: number } | undefined;

  #handlePointerDown = (e: React.PointerEvent) => {
    const beforeItem = this.items[this.index];
    const afterItem = this.items[this.index + 1];
    const dim = (r?: DOMRect) => (this.direction === "h" ? r?.width : r?.height);
    this.#thumbRef.value?.setPointerCapture(e.pointerId);
    // this.#pointerDownCoords = { x: e.clientX, y: e.clientY };
    const bw = dim(beforeItem?.value?.getBoundingClientRect()) ?? 0;
    const aw = dim(afterItem?.value?.getBoundingClientRect()) ?? 0;
    const handlePointerMove = (e: PointerEvent) => {
      const sizes = Object.values(this.items).map((i) => dim(i?.value?.getBoundingClientRect()) ?? 1);
      const offs = this.direction === "h" ? e.clientX : e.clientY;
      let nbw = offs;
      let naw = bw + aw - offs;
      const p = nbw / (nbw + naw);
      if (Math.abs(p - 0.5) < 0.01) {
        nbw = naw = (nbw + naw) / 2;
      }
      sizes[this.index] = nbw;
      sizes[this.index + 1] = naw;
      this.setLayout?.({ ...this.layout!, children: this.layout!.children.map((c, idx) => ({ ...c, flex: sizes[idx] })) });
    };
    const handlePointerUp = (e: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMove);
      this.#thumbRef.value?.releasePointerCapture(e.pointerId);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  protected render() {
    if (!this.layout) {
      return nothing;
    }
    return html`
      <div
        ref=${ref(this.#thumbRef)}
        class="thumb"
        style="cursor: ${this.direction === "h" ? "col-resize" : "row-resize"}"
        @pointerdown=${this.#handlePointerDown}
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: Separator;
  }
}
