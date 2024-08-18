import { Dirent, isDir } from "@frdy/sdk";
import { createComponent } from "@lit/react";
import clsx from "clsx";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import React from "react";
import { CursorPosition } from "../../../features/panels";
import "../../../lit-contexts/GlyphSizeProvider";
import { TabFilesView } from "../../../types";
import { List, createList } from "../../../utils/immutableList";
import "./ScrollableContainer";
import "./views/CondensedView";
import "./views/FullView";

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
    // console.error("_onMaxItemsPerColumnChange", e.detail);
  };

  private _onActiveIndexChange = (e: CustomEvent) => {
    // console.error("_onActiveIndexChange", e.detail);
  };

  protected render() {
    const bytesCount = this.items.reduce((acc, item) => acc + ((!isDir(item) ? item.attrs.size : 0) ?? 0), 0);
    const filesCount = this.items.reduce((acc, item) => acc + (!isDir(item) ? 1 : 0), 0);
    const cursorStyle = "firm";

    return html`
      <div class=${clsx("panel-root")}>
        <frdy-glyph-size-provider>
          <frdy-is-touch-screen-provider>
            <div class="panel-content">
              <div class="panel-columns">
                ${when(
                  this.view?.type === "condensed",
                  () => html`<frdy-condensed-view
                    tabIndex="0"
                    .view=${this.view as any /* TODO: think how to get rid of any */}
                    .cursorStyle=${cursorStyle}
                    .items=${this.items}
                    .selectedItemNames=${this.selectedItemNames}
                    @items-per-column-change=${this._onItemsPerColumnChange}
                    @active-index-change=${this._onActiveIndexChange}
                  ></frdy-condensed-view>`
                )}
                ${when(
                  this.view?.type === "full",
                  () => html`<frdy-full-view
                    tabIndex="0"
                    .view=${this.view as any /* TODO: think how to get rid of any */}
                    .cursorStyle=${cursorStyle}
                    .items=${this.items}
                    .selectedItemNames=${this.selectedItemNames}
                    @items-per-column-change=${this._onItemsPerColumnChange}
                    @active-index-change=${this._onActiveIndexChange}
                  ></frdy-full-view>`
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
