import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type IconsCache, iconsCacheContext } from "../../../lit-contexts/iconsCacheContext";

const TAG = "frdy-fileicon";

@customElement(TAG)
export class FileIcon extends LitElement {
  static styles = css`
    :host {
      display: flex;
    }
  `;

  @property()
  filepath?: string;

  @property({ type: Boolean })
  isDir: boolean;

  @property({ type: Boolean })
  isOpen: boolean;

  @property({ type: Number })
  size: number;

  constructor() {
    super();
    this.isDir = false;
    this.size = 20;
    this.isOpen = false;
  }

  @consume({ context: iconsCacheContext })
  @property({ attribute: false })
  icons?: IconsCache;

  private _task = new Task(this, {
    task: async ([filepath, isDir, isOpen]) => {
      if (!filepath) {
        return this.icons?.getDefaultIcon(isDir, isOpen);
      }
      return this.icons?.getIcon(filepath, isDir, isOpen);
    },
    args: () => [this.filepath, this.isDir, this.isOpen] as const,
  });

  protected render() {
    return this._task.render({
      initial: () =>
        html`<img
          style="width:${this.size}px;height:${this.size}px"
          src="data:image/svg+xml;base64,${this.icons?.getDefaultIcon(this.isDir, this.isOpen) ?? ""}"
          alt=${this.filepath}
        />`,
      pending: () =>
        html`<img
          style="width:${this.size}px;height:${this.size}px"
          src="data:image/svg+xml;base64,${this.icons?.getDefaultIcon(this.isDir, this.isOpen) ?? ""}"
          alt=${this.filepath}
        />`,
      complete: (x) => html`<img style="width:${this.size}px;height:${this.size}px" src="data:image/svg+xml;base64,${x}" alt=${this.filepath} />`,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FileIcon;
  }
}
