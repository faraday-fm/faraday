import { Dirent, FileSystemProvider, isDir, isHidden, readDir } from "@frdy/sdk";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fsContext } from "../../lit-contexts/fsContext";
import "../../lit-contexts/GlyphSizeProvider";
import { TabFilesView } from "../../types";
import { createList } from "../../utils/list/createList";
import { FrdyElement } from "../FrdyElement";
import "../panels/FilePanel/FilePanel";

const TAG = "frdy-file-panel-tab";

@customElement(TAG)
export class FilePanelTab extends FrdyElement {
  static shadowRootOptions: ShadowRootInit = { ...FrdyElement.shadowRootOptions, delegatesFocus: true };
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

  protected render() {
    return html`<frdy-file-panel .path=${this.path} .view=${this.view} .showHidden=${this.showHidden}></frdy-file-panel>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FilePanelTab;
  }
}

// export const FilePanelTabReact = createComponent({
//   tagName: TAG,
//   elementClass: FilePanelTab,
//   react: React,
// });
