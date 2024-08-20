import { command, context } from "@frdy/commands";
import { Dirent, isDir } from "@frdy/sdk";
import { createComponent, EventName } from "@lit/react";
import clsx from "clsx";
import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
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
  accessor items: List<Dirent>;

  @property({ attribute: false })
  accessor selectedItemNames: List<string>;

  @property({ attribute: false })
  accessor view: TabFilesView | undefined;

  @property({ attribute: false })
  accessor fileCursor: CursorPosition | undefined;

  @property({ type: Boolean })
  accessor showCursorWhenBlurred: boolean;

  @property()
  @context({ name: "filePanel.path", whenFocusWithin: true })
  accessor path: string | undefined;

  @context({ name: "filePanel.focus", whenFocusWithin: true })
  accessor isFilePanelFocus = true;

  @context({ name: "filePanel.firstItem", whenFocusWithin: true })
  accessor isFirstItem = false;

  @context({ name: "filePanel.lastItem", whenFocusWithin: true })
  accessor isLastItem = false;

  @context({ name: "filePanel.activeItem", whenFocusWithin: true })
  accessor activeItem = ""; // cursor.activeName

  @context({ name: "filePanel.totalItemsCount", whenFocusWithin: true })
  accessor totalItemsCount = 0; // items.size()

  @context({ name: "filePanel.selectedItemsCount", whenFocusWithin: true })
  accessor selectedItemsCount = 0; // selectedItemNames.size()

  constructor() {
    super();
    this.items = createList();
    this.selectedItemNames = createList();
    this.showCursorWhenBlurred = false;
  }

  private _onActiveIndexChange = (e: CustomEvent<{ activeIndex: number }>) => {
    this.isFirstItem = e.detail.activeIndex === 0;
    this.isLastItem = e.detail.activeIndex === this.items.size() - 1;
  };

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("items")) {
      this.totalItemsCount = this.items.size();
    }
  }

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
                ${choose(this.view?.type, [
                  [
                    "condensed",
                    () => html`<frdy-condensed-view
                      tabIndex="0"
                      .view=${this.view as any /* TODO: think how to get rid of any */}
                      .cursorStyle=${cursorStyle}
                      .items=${this.items}
                      .selectedItemNames=${this.selectedItemNames}
                      @active-index-change=${this._onActiveIndexChange}
                    ></frdy-condensed-view>`,
                  ],
                  [
                    "full",
                    () => html`<frdy-full-view
                      tabIndex="0"
                      .view=${this.view as any /* TODO: think how to get rid of any */}
                      .cursorStyle=${cursorStyle}
                      .items=${this.items}
                      .selectedItemNames=${this.selectedItemNames}
                      @active-index-change=${this._onActiveIndexChange}
                    ></frdy-full-view>`,
                  ],
                ])}
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
    onActiveIndexChange: "active-index-change" as EventName<CustomEvent<{ activeIndex: number }>>,
  },
});
