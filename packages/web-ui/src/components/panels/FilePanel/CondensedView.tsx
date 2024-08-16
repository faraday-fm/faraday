import { createComponent } from "@lit/react";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import { createList, type List } from "../../../utils/immutableList";
import type { Dirent, FileSystemProvider } from "@frdy/sdk";
import { ContextProvider } from "@lit/context";
import { fsContext } from "../../../lit-contexts/fsContext";
import { createIconsCache, iconsCacheContext } from "../../../lit-contexts/iconsCacheContext";
import type { CursorStyle } from "./types";
import "./MultiColumnList";
import "./FileName";
import "./ColumnCell";
import { createSettingsContext, settingsContext } from "../../../lit-contexts/settingsContext";
import { createExtensionRepoContext, extensionRepoContext } from "../../../lit-contexts/extensionRepoContext";
import { createExtensionsContext, extensionsContext } from "../../../lit-contexts/extensionContext";
import { createIconThemeContext, iconThemeContext } from "../../../lit-contexts/iconThemeContext";

const TAG = "frdy-condensed-view";

@customElement(TAG)
export class CondensedView extends LitElement {
  static styles = css`
    :host {
      display: grid;
    }
  `;

  private _fsProvider = new ContextProvider(this, { context: fsContext });
  private _settingsProvider = new ContextProvider(this, { context: settingsContext });
  private _extensionRepoProvider = new ContextProvider(this, { context: extensionRepoContext });
  private _extensionsProvider = new ContextProvider(this, { context: extensionsContext });
  private _iconThemeProvider = new ContextProvider(this, { context: iconThemeContext });
  private _iconsCacheProvider = new ContextProvider(this, { context: iconsCacheContext });

  public setFs(fs: FileSystemProvider) {
    if (!this._fsProvider.value) {
      this._fsProvider.setValue(fs);
      this._settingsProvider.setValue(createSettingsContext(fs));
      this._extensionRepoProvider.setValue(createExtensionRepoContext(fs));
      this._extensionsProvider.setValue(createExtensionsContext(fs, this._extensionRepoProvider.value));
      this._iconThemeProvider.setValue(createIconThemeContext(fs, this._settingsProvider.value, this._extensionsProvider.value));
      this._iconsCacheProvider.setValue(createIconsCache(fs, this._iconThemeProvider.value));
    }
  }

  @property()
  cursorStyle: CursorStyle;

  @property({ attribute: false })
  items: List<Dirent>;

  @property()
  selectedItemNames: List<string>;

  @property()
  topmostIndex: number;

  @property({ type: Number })
  activeIndex: number;

  @property({ type: Number })
  columnCount: number;

  @property({ type: Boolean })
  isTouchscreen: boolean;

  constructor() {
    super();
    this.cursorStyle = "firm";
    this.items = createList();
    this.selectedItemNames = createList();
    this.topmostIndex = 0;
    this.activeIndex = 0;
    this.columnCount = 1;
    this.isTouchscreen = false;
  }

  protected render() {
    const selectedNames = this.selectedItemNames.toSet();
    const rowHeight = 25;
    return html`
      <frdy-multicolumn-list
        topmostIndex=${this.topmostIndex}
        activeIndex=${this.activeIndex}
        columnCount=${this.columnCount}
        .renderItem=${(i: number) => html`
          <frdy-column-cell
            .selected=${selectedNames.has(this.items.get(i)?.filename ?? "")}
            .cursorStyle=${i === this.activeIndex && this.cursorStyle === "firm" ? "firm" : "hidden"}
          >
            <frdy-filename .dirent=${this.items.get(i)}></frdy-filename>
          </frdy-column-cell>
        `}
        .itemsCount=${this.items.size()}
        .itemHeight=${rowHeight}
        .isTouchscreen=${this.isTouchscreen}
      ></frdy-multicolumn-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: CondensedView;
  }
}

export const CondensedViewReact = createComponent({
  tagName: TAG,
  elementClass: CondensedView,
  react: React,
  events: {
    onActiveIndexChange: "active-index-change",
    onMaxItemsPerColumnChange: "max-items-per-column-change",
  },
});
