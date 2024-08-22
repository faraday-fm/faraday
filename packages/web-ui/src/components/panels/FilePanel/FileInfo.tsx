import { Dirent, FileType, isDir } from "@frdy/sdk";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { formatDateTime } from "../../../utils/date";
import { bytesToSize } from "../../../utils/number";
import { FrdyElement } from "../../FrdyElement";

const TAG = "frdy-file-info";

@customElement(TAG)
export class FileInfo extends FrdyElement {
  static styles = css`
    :host {
      display: flex;
      overflow: hidden;
      padding: 0.5rem 0;
      border-block-start: 1px solid var(--panel-border);
    }

    .name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      flex: 1;
    }
    .size {
      white-space: nowrap;
      justify-self: flex-end;
      margin: 0 0.75rem;
    }
    .time {
      white-space: nowrap;
      justify-self: flex-end;
    }
  `;

  @property({ attribute: false })
  accessor file: Dirent | undefined;

  protected render() {
    return html`
      <div class="name">${this.file?.filename}</div>
      <div class="size">${formatFileSize(this.file)}</div>
      <div class="time">${this.file?.attrs.mtime ? formatDateTime(new Date(this.file.attrs.mtime * 1000)) : undefined}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FileInfo;
  }
}

function formatFileSize(e?: Dirent) {
  if (!e) {
    return "";
  }
  if (isDir(e)) {
    if (e.attrs.type & FileType.Symlink) return "symlink";
    return e.filename === ".." ? "up" : "dir";
  }
  switch (true) {
    case (e.attrs.type & FileType.Symlink) !== 0:
      return "symlink";
    case (e.attrs.type & FileType.Device) !== 0:
      return "block dev";
    case (e.attrs.type & FileType.CharDevice) !== 0:
      return "char dev";
    case (e.attrs.type & FileType.NamedPipe) !== 0:
      return "fifo";
    case (e.attrs.type & FileType.Socket) !== 0:
      return "socket";
    default:
      return bytesToSize(e.attrs.size ?? 0, 999999);
  }
}
