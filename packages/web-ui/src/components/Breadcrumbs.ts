import { consume } from "@lit/context";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { join } from "lit/directives/join.js";
import { map } from "lit/directives/map.js";
import * as v from "../css";
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
    }
    .breadcrumb {
      display: flex;
      gap: 0.5ch;
    }
  `;

  @consume({ context: iconsCacheContext, subscribe: true })
  accessor icons!: IconsCache;

  @property({ attribute: false })
  accessor items: string[] | undefined;

  protected render() {
    return html`${join(
      map(
        this.items,
        (item) =>
          html`<span class="breadcrumb"><frdy-fileicon .size=${16} .filepath=${item} .isDir=${true} .isOpen=${true} .icons=${this.icons}></frdy-fileicon>${item}</span>`
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
