import { consume } from "@lit/context";
import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { join } from "lit/directives/join.js";
import { map } from "lit/directives/map.js";
import { iconsCacheContext, type IconsCache } from "../lit-contexts/iconsCacheContext";
import "./FileIcon";
import { FrdyElement } from "./FrdyElement";

const TAG = "frdy-breadcrumbs";

@customElement(TAG)
export class Breadcrumbs extends FrdyElement {
  static styles = css`
    :host {
      display: flex;
      gap: 1ch;
      font-size: smaller;
    }
    .breadcrumb {
      align-items: center;
      display: flex;
      gap: 0.5ch;
    }
  `;

  @consume({ context: iconsCacheContext, subscribe: true })
  accessor icons!: IconsCache;

  @property({ attribute: false })
  accessor items: string[] | undefined;

  protected render() {
    const items = this.items;
    if (!items || items.length === 0) return nothing;
    return html`${join(
      map(
        this.items,
        (item, index) =>
          html`<span class="breadcrumb" style="${index === items.length - 1 ? "font-weight: bolder" : ""}"
            ><frdy-fileicon .size=${16} .filepath=${item} .isDir=${true} .isOpen=${true} .icons=${this.icons}></frdy-fileicon>${item}</span
          >`
      ),
      () => html`›`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: Breadcrumbs;
  }
}
