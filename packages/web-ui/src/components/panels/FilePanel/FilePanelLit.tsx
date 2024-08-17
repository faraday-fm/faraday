import { createComponent } from "@lit/react";
import { LitElement, type PropertyValues, type TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { range } from "lit/directives/range.js";
import { when } from "lit/directives/when.js";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import React from "react";
import "./ScrollableContainer";
import clsx from "clsx";
import "../../../lit-contexts/GlyphSizeProvider";
import { Dirent, FileSystemProvider, isDir } from "@frdy/sdk";
import { TabFilesView } from "../../../types";
import { createList, List } from "../../../utils/immutableList";
import { CursorPosition } from "../../../features/panels";
import "./CondensedView";
import { boolean } from "valibot";
import { createSettingsContext, settingsContext } from "../../../lit-contexts/settingsContext";
import { createExtensionRepoContext, extensionRepoContext } from "../../../lit-contexts/extensionRepoContext";
import { createExtensionsContext, extensionsContext } from "../../../lit-contexts/extensionContext";
import { createIconThemeContext, iconThemeContext } from "../../../lit-contexts/iconThemeContext";
import { createIconsCache, iconsCacheContext } from "../../../lit-contexts/iconsCacheContext";
import { ContextProvider } from "@lit/context";
import { fsContext } from "../../../lit-contexts/fsContext";

const TAG = "frdy-file-panel";

@customElement(TAG)
export class FilePanel extends LitElement {
  static styles = css`
    :host {
      display: grid;
    }
    .panel-root {
      width: 100%;
      height: 100%;
      position: relative;
      color: var(--panel-foreground);
      background-color: var(--panel-background);
      display: grid;
      overflow: hidden;
      outline: none;
      user-select: none;
      &.-focused {
        background-color: var(--panel-background-focus);
      }
    }
    .panel-content {
      display: grid;
      grid-template-rows: 1fr auto auto;
      overflow: hidden;
    }
    .panel-columns {
      display: grid;
      overflow: hidden;
      &:focus {
        outline: none;
      }
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


  @property({ attribute: false })
  items: List<Dirent>;

  @property({ attribute: false })
  selectedItemNames: List<string>;

  @property({ attribute: false })
  view?: TabFilesView;

  @property({ attribute: false })
  fileCursor?: CursorPosition;

  @property({ type: Boolean })
  showCursorWhenBlurred: boolean;

  @property()
  path?: string;

  constructor() {
    super();
    this.items = createList();
    this.selectedItemNames = createList();
    this.showCursorWhenBlurred = false;
  }

  private _onItemsPerColumnChange = (e: CustomEvent) => {
    console.error("_onMaxItemsPerColumnChange", e.detail);
  }

  private _onActiveIndexChange = (e: CustomEvent) => {
    console.error("_onActiveIndexChange", e.detail);
  }

  protected render() {
    const bytesCount = this.items.reduce((acc, item) => acc + ((!isDir(item) ? item.attrs.size : 0) ?? 0), 0);
    const filesCount = this.items.reduce((acc, item) => acc + (!isDir(item) ? 1 : 0), 0);
    const cursorStyle = "firm";

    return html`
      <div class=${clsx("panel-root")} tab-index="0">
        <frdy-glyph-size-provider>
          <frdy-is-touch-screen-provider>
            <div class="panel-content">
              <div class="panel-columns">
                ${when(
                  this.view?.type === "condensed",
                  () => html`<frdy-condensed-view
                    .cursorStyle=${cursorStyle}
                    .items=${this.items}
                    .selectedItemNames=${this.selectedItemNames}
                    @items-per-column-change=${this._onItemsPerColumnChange}
                    @active-index-change=${this._onActiveIndexChange}
                  ></frdy-condensed-view>`
                )}
              </div>
              <div class="file-info-panel"></div>
              <div class="panel-footer">${`${bytesCount.toLocaleString()} bytes in ${filesCount.toLocaleString()} files`}</div>
            </div>
          </frdy-is-touch-screen-provider>
        </frdy-glyph-size-provider>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FilePanel;
  }
}

export const FilePanelReact = createComponent({
  tagName: TAG,
  elementClass: FilePanel,
  react: React,
  events: {
    onActiveIndexChange: "active-index-change",
    onItemsPerColumnChange: "items-per-column-change",
  },
});
