import { type Dirent, isDir, isHidden } from "@frdy/sdk";
import { createComponent } from "@lit/react";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import { IconsCache } from "../../../lit-contexts/iconsCacheContext";
import "./FileIcon";

@customElement("frdy-filename")
export class FileName extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .root {
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 calc(0.25rem - 1px);
    }
  `;

  @property({ attribute: false })
  accessor dirent: Dirent | undefined;

  @property({ attribute: false })
  accessor icons!: IconsCache;

  protected render() {
    if (!this.dirent) return null;
    return html`
      <div class="root" style=${isHidden(this.dirent) && "opacity: 0.5"}>
        <frdy-fileicon .filepath=${this.dirent.path} .isDir=${isDir(this.dirent)} .icons=${this.icons}></frdy-fileicon>
        <span class="name">${this.dirent.filename}</span>
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
