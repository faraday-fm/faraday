import { createComponent, EventName } from "@lit/react";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import "../../lit-contexts/GlyphSizeProvider";
import "../panels/FilePanel/FilePanel";
import { TabFilesView } from "../../types";
import { consume } from "@lit/context";
import { fsContext } from "../../lit-contexts/fsContext";
import { Dirent, FileSystemProvider, isDir, isHidden } from "@frdy/sdk";
import { Task } from "@lit/task";
import { createList } from "../../utils/immutableList";

const TAG = "frdy-file-panel-tab";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  usage: "sort",
  sensitivity: "case",
});

function fsCompare(a: Dirent, b: Dirent) {
  if (isDir(a) && !isDir(b)) return -1;
  if (!isDir(a) && isDir(b)) return 1;
  return collator.compare(a.filename, b.filename);
}

@customElement(TAG)
export class FilePanelTab extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property({ attribute: false })
  accessor view: TabFilesView | undefined;

  @property({ attribute: false })
  accessor path: string | undefined;

  @property({ type: Boolean })
  accessor showHidden = false;

  constructor() {
    super();
  }

  @consume({ context: fsContext })
  accessor fs!: FileSystemProvider;

  #task = new Task(this, {
    task: async ([path, showHidden], options) => {
      if (!path) {
        return [];
      }
      const handle = await this.fs.openDir(path, options);
      const dir = await this.fs.readDir(handle, options);
      await this.fs.close(handle);
      let files = dir.files;
      if (!showHidden) {
        files = files.filter((f) => !isHidden(f));
      }
      files = files.sort(fsCompare);
      return files;
    },
    args: () => [this.path, this.showHidden] as const,
  });

  protected render() {
    return this.#task.render({
      complete: (files) => html`<frdy-file-panel .view=${this.view} .items=${createList(files)}></frdy-file-panel>`,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FilePanelTab;
  }
}

export const FilePanelTabReact = createComponent({
  tagName: TAG,
  elementClass: FilePanelTab,
  react: React,
});
