import { type Dirent, isDir, isHidden } from "@frdy/sdk";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { IconsCache } from "../../../lit-contexts/iconsCacheContext";
import { FrdyElement } from "../../FrdyElement";
import "../../FileIcon";

@customElement("frdy-filename")
export class FileName extends FrdyElement {
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

  // TODO: carefully handle right-to-left characters. See: https://levelup.gitconnected.com/spoofing-file-extensions-ethical-hacking-bd128189738b
  protected render() {
    if (!this.dirent) return null;
    return html`
      <div class="root" style=${isHidden(this.dirent) && "opacity: 0.5"}>
        <frdy-fileicon .filepath=${this.dirent.path} .isDir=${isDir(this.dirent)} .isOpen=${this.dirent.filename === ".."} .icons=${this.icons}></frdy-fileicon>
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

// export const FileNameReact = createComponent({
//   tagName: "frdy-filename",
//   elementClass: FileName,
//   react: React,
// });
