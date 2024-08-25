import { Task } from "@lit/task";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { type IconsCache } from "../lit-contexts/iconsCacheContext";
import { FrdyElement } from "./FrdyElement";

const TAG = "frdy-fileicon";

const defaultDirIcon = btoa(
  '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M13.84376,7.53645l-1.28749-1.0729A2,2,0,0,0,11.27591,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V10a2,2,0,0,0-2-2H15.12412A2,2,0,0,1,13.84376,7.53645Z" fill="#90a4ae" /></svg>'
);
const defaultDirOpenIcon = btoa(
  '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M28.96692,12H9.44152a2,2,0,0,0-1.89737,1.36754L4,24V10H28a2,2,0,0,0-2-2H15.1241a2,2,0,0,1-1.28038-.46357L12.5563,6.46357A2,2,0,0,0,11.27592,6H4A2,2,0,0,0,2,8V24a2,2,0,0,0,2,2H26l4.80523-11.21213A2,2,0,0,0,28.96692,12Z" fill="#90a4ae" /></svg>'
);
const defaultFileIcon = btoa(
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m5 2H6v16h12v-9h-7V4z" fill="#90a4ae" /></svg>'
);

function getDefaultIcon(isDir: boolean, isOpen: boolean) {
  return isDir ? (isOpen ? defaultDirOpenIcon : defaultDirIcon) : defaultFileIcon;
}

@customElement(TAG)
export class FileIcon extends FrdyElement {
  static styles = css`
    :host {
      display: flex;
    }
  `;

  @property()
  accessor filepath: string | undefined;

  @property({ type: Boolean })
  accessor isDir: boolean;

  @property({ type: Boolean })
  accessor isOpen: boolean;

  @property({ type: Number })
  accessor size: number;

  constructor() {
    super();
    this.isDir = false;
    this.size = 18;
    this.isOpen = false;
  }

  @property({ attribute: false })
  accessor icons!: IconsCache;

  #task = new Task(this, {
    task: async ([icons, filepath, isDir, isOpen]) => {
      if (!filepath) {
        return getDefaultIcon(isDir, isOpen);
      }
      return icons.getIcon(filepath, isDir, isOpen);
    },
    args: () => [this.icons, this.filepath, this.isDir, this.isOpen] as const,
  });

  protected render() {
    const defaultIcon = () =>
      html`<img
        style="width:${this.size}px;height:${this.size}px"
        src="data:image/svg+xml;base64,${getDefaultIcon(this.isDir, this.isOpen) ?? ""}"
        alt=${ifDefined(this.filepath)}
      />`;
    return this.#task.render({
      initial: defaultIcon,
      pending: defaultIcon,
      error: defaultIcon,
      complete: (content) =>
        html`<img style="width:${this.size}px;height:${this.size}px" src="data:image/svg+xml;base64,${content}" alt=${ifDefined(this.filepath)} />`,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FileIcon;
  }
}
