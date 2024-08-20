import { createComponent, EventName } from "@lit/react";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import "../../lit-contexts/GlyphSizeProvider";
import "../panels/FilePanel/FilePanel";
import { TabFilesView } from "../../types";
import { consume } from "@lit/context";
import { fsContext } from "../../lit-contexts/fsContext";
import { FileSystemProvider, isHidden } from "@frdy/sdk";
import { Task } from "@lit/task";
import { createList } from "../../utils/immutableList";

const TAG = "frdy-file-panel-tab";

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

  constructor() {
    super();
  }

  @consume({ context: fsContext })
  accessor fs!: FileSystemProvider;

  #task = new Task(this, {
    task: async ([path], options) => {
      if (!path) {
        return [];
      }
      const handle = await this.fs.openDir(path, options);
      const dir = await this.fs.readDir(handle, options);
      await this.fs.close(handle);
      return dir.files.filter((f) => !isHidden(f));
    },
    args: () => [this.path] as const,
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
