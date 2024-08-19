import { type Dirent, isDir, isHidden } from "@frdy/sdk";
import { createComponent } from "@lit/react";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import "./FileIcon";
import { consume } from "@lit/context";
import { IconsCache, iconsCacheContext } from "../../../lit-contexts/iconsCacheContext";

@customElement("frdy-filename")
export class FileName extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }
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
  accessor dirent: Dirent | undefined;

  @property({ attribute: false })
  accessor icons!: IconsCache;

  protected render() {
    if (!this.dirent) return null;
    return html`
      <div style="display: flex; align-items: center; ${isHidden(this.dirent) && "opacity: 0.5"};">
        <frdy-fileicon .filepath=${this.dirent.path} .isDir=${isDir(this.dirent)} .icons=${this.icons}></frdy-fileicon>
        <span class="line-item">
          <span class="file-name"> ${this.dirent.filename} </span>
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
