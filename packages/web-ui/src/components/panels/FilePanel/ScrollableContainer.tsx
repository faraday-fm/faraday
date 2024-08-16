import { createComponent } from "@lit/react";
import { LitElement, type PropertyValues, css, html } from "lit";
import { customElement, eventOptions, property } from "lit/decorators.js";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import React from "react";

const TAG = "frdy-scrollable";

@customElement(TAG)
export class ScrollableLit extends LitElement {
  static styles = css`
    :host {
      display: grid;
    }
  `;

  private scrollPaneRef: Ref<HTMLInputElement> = createRef();
  private containerRef: Ref<HTMLInputElement> = createRef();

  @property({ type: Number })
  fullScrollHeight: number;

  @property({ type: Number })
  fullScrollTop: number;

  @property({ type: Number })
  velocityFactor: number;

  @property({ type: Number })
  frictionFactor: number;

  @property({ type: Boolean })
  isTouchscreen: boolean;

  constructor() {
    super();
    this.fullScrollHeight = 0;
    this.fullScrollTop = 0;
    this.velocityFactor = 20;
    this.frictionFactor = 0.95;
    this.isTouchscreen = false;
  }

  @eventOptions({ passive: true })
  private onWheel(e: WheelEvent) {
    this.updateScrollTop(e.deltaY);
  }

  #touchStartY: number | undefined;
  #touchStartTime = 0;
  #velocity = 0;
  #isInertiaScrolling = false;

  private onPointerDown = (event: PointerEvent) => {
    if (!this.isTouchscreen) return;

    this.#touchStartY = event.clientY;
    this.#touchStartTime = performance.now();
    this.#isInertiaScrolling = false;
    this.#velocity = 0;
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isTouchscreen || this.#touchStartY == null) return;

    const touchCurrentY = event.clientY;
    const deltaY = this.#touchStartY - touchCurrentY;
    if (Math.abs(deltaY) < 3) {
      return;
    }

    this.containerRef.value?.setPointerCapture(event.pointerId);
    this.updateScrollTop(deltaY);
    this.#touchStartY = touchCurrentY;
    const currentTime = performance.now();
    const timeDelta = currentTime - this.#touchStartTime;
    this.#touchStartTime = currentTime;
    if (timeDelta > 0) {
      this.#velocity = deltaY / timeDelta;
    }
    event.preventDefault();
  };

  private onPointerUp = (event: PointerEvent) => {
    if (!this.isTouchscreen || this.#touchStartY == null) return;

    this.#touchStartY = undefined;
    this.containerRef.value?.releasePointerCapture(event.pointerId);
    const inertiaScroll = () => {
      if (Math.abs(this.#velocity) > 0.1) {
        this.updateScrollTop(this.#velocity * this.velocityFactor);
        this.#velocity *= this.frictionFactor;
        requestAnimationFrame(inertiaScroll);
      } else {
        this.#isInertiaScrolling = false;
        this.updateScrollTop(0);
      }
    };
    if (!this.#isInertiaScrolling) {
      this.#isInertiaScrolling = true;
      requestAnimationFrame(inertiaScroll);
    }
  };

  protected updated(_changedProperties: PropertyValues): void {
    if (this.scrollPaneRef.value && _changedProperties.has("fullScrollTop")) {
      this.scrollPaneRef.value.scrollTop = this.fullScrollTop;
    }
  }

  private updateScrollTop(scrollDelta: number) {
    const currScrollTop = this.fullScrollTop;
    let newScrollTop = currScrollTop + scrollDelta;
    newScrollTop = Math.min(newScrollTop, this.fullScrollHeight);
    newScrollTop = Math.max(0, newScrollTop);
    if (currScrollTop !== newScrollTop) {
      this.scrollTop = newScrollTop;
      this.dispatchEvent(
        new CustomEvent("scroll", {
          detail: { top: newScrollTop, isInertiaScrolling: this.#isInertiaScrolling },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  render() {
    return html`
      <div style=${["overflow: hidden; position: relative; touch-action: none;", ...this.style]}>
        <div ref=${ref(this.scrollPaneRef)} style="position: absolute; inset: 0; overflowY: scroll;">
          <div style="height: ${this.fullScrollHeight + (this.scrollPaneRef.value?.clientHeight ?? 0)}px"></div>
        </div>
        <div
          ref=${ref(this.containerRef)}
          style="position: absolute; inset: 0; pointerEvents: auto"
          @wheel=${this.onWheel}
          @pointerdown=${this.onPointerDown}
          @pointermove=${this.onPointerMove}
          @pointerup=${this.onPointerUp}
          @pointercancel=${this.onPointerUp}
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: ScrollableLit;
  }
}

export const ScrollableReact = createComponent({
  tagName: TAG,
  elementClass: ScrollableLit,
  react: React,
  events: {
    onScroll: "scroll",
  },
});
