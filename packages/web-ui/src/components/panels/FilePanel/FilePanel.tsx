import { context } from "@frdy/commands";
import { Dirent, isDir } from "@frdy/sdk";
import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import "../../../lit-contexts/GlyphSizeProvider";
import { TabFilesView } from "../../../types";
import { List, createList } from "../../../utils/immutableList";
import "./ScrollableContainer";
import "./views/CondensedView";
import "./views/FullView";
import "./FileInfo";

const TAG = "frdy-file-panel";

@customElement(TAG)
export class FilePanel extends LitElement {
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = css`
    :host {
      display: grid;
      width: 100%;
      height: 100%;
      position: relative;
      color: var(--panel-foreground);
      background-color: var(--panel-background);
      display: grid;
      overflow: hidden;
      outline: none;
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
    .panel-footer {
      border-block-start: 1px solid var(--panel-border);
    }
  `;

  @property({ attribute: false })
  accessor items: List<Dirent>;

  @property({ attribute: false })
  accessor selectedItemNames: List<string>;

  @property({ attribute: false })
  accessor view: TabFilesView | undefined;

  @property({ type: Boolean })
  accessor showCursorWhenBlurred: boolean;

  @property({ attribute: false })
  accessor activeIndex = 0;

  @property({ attribute: false })
  accessor activeItem: Dirent | undefined;

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
  accessor activeItemName: string | undefined;

  @context({ name: "filePanel.totalItemsCount", whenFocusWithin: true })
  accessor totalItemsCount = 0;

  @context({ name: "filePanel.selectedItemsCount", whenFocusWithin: true })
  accessor selectedItemsCount = 0; // selectedItemNames.size()

  constructor() {
    super();
    this.items = createList();
    this.selectedItemNames = createList();
    this.showCursorWhenBlurred = false;
  }

  #onActiveIndexChange = (e: CustomEvent<{ activeIndex: number }>) => {
    this.activeIndex = e.detail.activeIndex;
    this.#updateActiveItem();
  };

  #updateActiveItem = () => {
    this.totalItemsCount = this.items.size();
    this.activeItem = this.items.get(this.activeIndex);
    this.activeItemName = this.activeItem?.filename;
    this.isFirstItem = this.activeIndex === 0;
    this.isLastItem = this.activeIndex === this.items.size() - 1;
  };

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("items")) {
      this.#updateActiveItem();
    }
    super.willUpdate(_changedProperties);
  }

  protected render() {
    const bytesCount = this.items.reduce((acc, item) => acc + ((!isDir(item) ? item.attrs.size : 0) ?? 0), 0);
    const filesCount = this.items.reduce((acc, item) => acc + (!isDir(item) ? 1 : 0), 0);
    const cursorStyle = "firm";

    return html`
      <frdy-glyph-size-provider>
        <frdy-is-touch-screen-provider>
          <div class="panel-content" tabindex="0">
            <div class="panel-columns">
              ${choose(this.view?.type, [
                [
                  "condensed",
                  () => html`<frdy-condensed-view
                    .view=${this.view as any /* TODO: think how to get rid of any */}
                    .cursorStyle=${cursorStyle}
                    .items=${this.items}
                    .selectedItemNames=${this.selectedItemNames}
                    @active-index-change=${this.#onActiveIndexChange}
                  ></frdy-condensed-view>`,
                ],
                [
                  "full",
                  () => html`<frdy-full-view
                    .view=${this.view as any /* TODO: think how to get rid of any */}
                    .cursorStyle=${cursorStyle}
                    .items=${this.items}
                    .selectedItemNames=${this.selectedItemNames}
                    @active-index-change=${this.#onActiveIndexChange}
                  ></frdy-full-view>`,
                ],
              ])}
            </div>
            <frdy-file-info .file=${this.activeItem}></frdy-file-info>
            <div class="panel-footer">${`${bytesCount.toLocaleString()} bytes in ${filesCount.toLocaleString()} files`}</div>
          </div>
        </frdy-is-touch-screen-provider>
      </frdy-glyph-size-provider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FilePanel;
  }
}
