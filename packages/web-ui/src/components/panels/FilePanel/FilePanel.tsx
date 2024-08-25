import { command, context } from "@frdy/commands";
import { Dirent, FileSystemProvider, isDir, isHidden, readDir } from "@frdy/sdk";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { PropertyValues, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { range } from "lit/directives/range.js";
import { fsContext } from "../../../lit-contexts/fsContext";
import "../../../lit-contexts/GlyphSizeProvider";
import { TabFilesView } from "../../../types";
import { List, createList } from "../../../utils/list/createList";
import { combine, dir } from "../../../utils/path";
import { FrdyElement } from "../../FrdyElement";
import "../../FileInfo";
import { SelectionType } from "./MultiColumnList";
import "./ScrollableContainer";
import "./views/CondensedView";
import "./views/FullView";

const TAG = "frdy-file-panel";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  usage: "sort",
  sensitivity: "case",
});

function fsCompare(a: Dirent, b: Dirent) {
  if (a.filename === "..") return -1;
  if (b.filename === "..") return 1;
  if (isDir(a) && !isDir(b)) return -1;
  if (!isDir(a) && isDir(b)) return 1;
  return collator.compare(a.filename, b.filename);
}

@customElement(TAG)
export class FilePanel extends FrdyElement {
  static shadowRootOptions: ShadowRootInit = { ...FrdyElement.shadowRootOptions, delegatesFocus: true };
  static styles = css`
    :host {
      display: grid;
      width: 100%;
      height: 100%;
      position: relative;
      /* color: var(--panel-foreground, var(--list-focusForeground, #adbac7)); */
      background-color: var(--sideBar-background, #22272e);
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
    }
    .panel-footer {
      border-block-start: 1px solid var(--panel-border);
    }
  `;

  @consume({ context: fsContext })
  accessor fs!: FileSystemProvider;

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
  accessor topmostIndex = 0;

  @property({ attribute: false })
  accessor activeItem: Dirent | undefined;

  @property({ type: Boolean })
  accessor showHidden = false;

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
  accessor activeItemName = "";

  @context({ name: "filePanel.topmostItem", whenFocusWithin: true })
  accessor topmostItemName = "";

  @context({ name: "filePanel.totalItemsCount", whenFocusWithin: true })
  accessor totalItemsCount = 0;

  @context({ name: "filePanel.selectedItemsCount", whenFocusWithin: true })
  accessor selectedItemsCount = 0;

  @command({ whenFocusWithin: true })
  async open() {
    if (this.activeItemName === "..") {
      await this.dirUp();
    } else {
      if (this.activeItem) {
        if (isDir(this.activeItem)) {
          this.#positionsStack.push({ topmostName: this.topmostItemName, activeName: this.activeItemName });
          this.path = combine((this.path ?? "") + "/", this.activeItemName ?? ".");
          this.#task.run();
          await this.#task.taskComplete;
          this.selectedItemNames = createList();
          this.activeIndex = 0;
          this.#updateActiveItem();
        }
      }
    }
  }

  @command({ whenFocusWithin: true })
  async openHome() {
    this.#positionsStack = [];
    this.path = ".";
    this.#task.run();
    await this.#task.taskComplete;
    this.selectedItemNames = createList();
    this.activeIndex = 0;
    this.#updateActiveItem();
}

  @command({ whenFocusWithin: true })
  async dirUp() {
    this.path = dir(this.path ?? "/");
    if (this.path.endsWith("/")) {
      this.path = this.path.substring(0, this.path.length - 1);
    }
    this.#task.run();
    await this.#task.taskComplete;
    this.selectedItemNames = createList();
    const pos = this.#positionsStack.pop();
    if (pos) {
      const activeIdx = this.items.findIndex((i) => i.filename === pos.activeName);
      const topmostIdx = this.items.findIndex((i) => i.filename === pos.topmostName);
      if (activeIdx >= 0) {
        if (topmostIdx >= 0) {
          this.topmostIndex = topmostIdx;
        }
        this.activeIndex = activeIdx;
        this.#updateActiveItem();
      }
    }
  }

  @command({ whenFocusWithin: false })
  focusNextPanel() {
    this.focus();
  }

  #positionsStack: { topmostName: string; activeName: string }[] = [];

  #task = new Task(this, {
    task: async ([path, showHidden], options) => {
      if (!path) {
        return [];
      }
      let files = await readDir(this.fs, path, options);
      if (!showHidden) {
        files = files.filter((f) => !isHidden(f));
      }
      files.sort(fsCompare);
      this.items = createList(files);
      return files;
    },
    args: () => [this.path, this.showHidden] as const,
  });

  constructor() {
    super();
    this.items = createList();
    this.selectedItemNames = createList();
    this.showCursorWhenBlurred = false;
  }

  #prevSelect: boolean | undefined;

  #onActiveIndexChange = (e: CustomEvent<{ activeIndex: number; topmostIndex: number; select: SelectionType }>) => {
    if (e.detail.select !== "none") {
      if (this.#prevSelect === undefined) {
        const fn = this.items.get(this.activeIndex)?.filename;
        this.#prevSelect = this.selectedItemNames.findIndex((i) => i === fn) < 0;
      }
      for (const i of range(Math.min(this.activeIndex, e.detail.activeIndex), Math.max(this.activeIndex, e.detail.activeIndex) + 1)) {
        if (e.detail.select === "exclude-active" && i === e.detail.activeIndex) {
          continue;
        }
        const fn = this.items.get(i)?.filename;
        if (this.#prevSelect) {
          this.selectedItemNames = this.selectedItemNames.append(fn!);
        } else {
          this.selectedItemNames = this.selectedItemNames.filter((i) => i !== fn);
        }
      }
    } else {
      this.#prevSelect = undefined;
    }
    this.topmostIndex = e.detail.topmostIndex;
    this.activeIndex = e.detail.activeIndex;
    this.#updateActiveItem();
  };

  #updateActiveItem = () => {
    this.totalItemsCount = this.items.size();
    this.selectedItemsCount = this.selectedItemNames.size();
    this.activeItem = this.items.get(this.activeIndex);
    this.activeItemName = this.activeItem?.filename ?? "";
    this.topmostItemName = this.items.get(this.topmostIndex)?.filename ?? "";
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
        <div class="panel-content">
          <div class="panel-columns">
            ${choose(this.view?.type, [
              [
                "condensed",
                () => html`<frdy-condensed-view
                  .view=${this.view as any /* TODO: think how to get rid of any */}
                  .topmostIndex=${this.topmostIndex}
                  .activeIndex=${this.activeIndex}
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
                  .topmostIndex=${this.topmostIndex}
                  .activeIndex=${this.activeIndex}
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
      </frdy-glyph-size-provider>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FilePanel;
  }
}
