import type { Dirent } from "@frdy/sdk";
import { consume } from "@lit/context";
import { css, CSSResultGroup, html, nothing, render } from "lit";
import { property } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import "../../../../lit-contexts/GlyphSizeProvider";
import { isTouchScreenContext } from "../../../../lit-contexts/isTouchScreenContext";
import { IconsCache, iconsCacheContext } from "../../../../lit-contexts/iconsCacheContext";
import { TabFilesView } from "../../../../types";
import { createList, type List } from "../../../../utils/list/createList";
import { FrdyElement } from "../../../FrdyElement";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import type { CursorStyle } from "../types";
import { DragGhost } from "./DragGhost";

export abstract class View<T extends TabFilesView> extends FrdyElement {
  static styles = css`
    :host {
      display: grid;
      position: relative;
      overflow: hidden;
    }
  ` as CSSResultGroup;

  @property({ attribute: false })
  accessor view: T | undefined;

  @property()
  accessor cursorStyle: CursorStyle;

  @property({ attribute: false })
  accessor items: List<Dirent>;

  @property({ attribute: false })
  accessor selectedItemNames: List<string>;

  @consume({ context: iconsCacheContext })
  accessor icons!: IconsCache;

  @consume({ context: isTouchScreenContext, subscribe: true })
  accessor isTouchscreen!: boolean;

  constructor() {
    super();
    this.cursorStyle = "firm";
    this.items = createList();
    this.selectedItemNames = createList();
  }

  connectedCallback(): void {
    super.connectedCallback();
    const dragGhost = new DragGhost();
    this.addEventListener("dragstart", (e) => {
      document.body.append(dragGhost);
      const selectedNames = this.selectedItemNames.toSet();
      render(html`${map(this.items, (n, i) => (selectedNames.has(n.filename) ? this.renderItem(i, false, new Set()) : nothing))}`, dragGhost);
      const rect = (e.composedPath()[0] as Element).getBoundingClientRect();
      e.dataTransfer?.setDragImage(dragGhost, e.clientX - rect.x, e.clientY - rect.y);
    });
    this.addEventListener("dragend", (e) => {
      dragGhost.remove();
    });
  }

  protected renderItem = (index: number, isActive: boolean, selectedNames: Set<string>) => {
    return html`
      <frdy-column-cell
        .selected=${selectedNames.has(this.items.get(index)?.filename ?? "")}
        .cursorStyle=${isActive && this.cursorStyle === "firm" ? "firm" : "hidden"}
        .isTouchscreen=${this.isTouchscreen}
      >
        <frdy-filename .dirent=${this.items.get(index)} .icons=${this.icons}></frdy-filename>
      </frdy-column-cell>
    `;
  };
}
