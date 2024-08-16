import { type Dirent, isDir, isHidden } from "@frdy/sdk";
import { createComponent } from "@lit/react";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import "./FileIcon";

@customElement("frdy-filename")
export class FileName extends LitElement {
  static styles = css`
  .line-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 calc(0.25rem - 1px);
    flex-grow: 1;
    display: flex;
  }
  .file-name {
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  `;

  @property({ attribute: false })
  dirent?: Dirent;

  @property({ type: Number })
  height?: number;

  protected render() {
    if (!this.dirent) return null;
    return html`
    <div style="display: flex; align-items: center; opacity: ${isHidden(this.dirent) ? 0.5 : 1};">
      <frdy-fileicon .filepath=${this.dirent.path} .isDir=${isDir(this.dirent)}></frdy-fileicon>
      <span class="line-item" style="line-height: ${this.height ?? 27}px;">
        <span class="file-name">
          ${this.dirent.filename}
        </span>
      </span>
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "frdy-filename": FileName;
  }
}

export const FileNameReact = createComponent({
  tagName: "frdy-filename",
  elementClass: FileName,
  react: React,
});
