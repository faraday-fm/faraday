import { command } from "@frdy/commands";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import { css, html, PropertyValues, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import xTermCss from "../../node_modules/@xterm/xterm/css/xterm.css" assert { type: "css" };
import { FrdyElement } from "../components/FrdyElement";
import { Terminal as TerminalApi } from "../types";

const TAG = "frdy-terminal";

var enc = new TextEncoder();

@customElement(TAG)
export class Terminal extends FrdyElement {
  // static shadowRootOptions: ShadowRootInit = { ...FrdyElement.shadowRootOptions, delegatesFocus: true };
  static styles = css`
    :host {
      display: grid;
      overflow: hidden;
    }
    .root {
      display: flex;
      align-items: end;
      overflow: hidden;
    }
    ${unsafeCSS(xTermCss)}
  `;

  @property({ attribute: false })
  accessor api: TerminalApi | undefined;

  #waitForPrompt = false;

  @command()
  focusTerminal() {
    this.#xterm.focus();
  }

  @command()
  setTerminalDir({ dir }: { dir: string }) {
    // this.#xterm.write(` cd ${dir}\r\n`);
    this.#waitForPrompt = true;
    this.#session?.then((s) => this.api?.sendData(s, `cd "${dir}"\n`));

    // this.#xterm.write("\x1b[12l");
    // this.#xterm.input(` cd ${dir}\n`, false);
    // this.#xterm.write("\x1b[12h");
    // this.#xterm.write("\x1b[1F");
    // this.#xterm.write("\x1b[?47h\x1b[1F\x1b[0J");
  }

  #xterm: XTerm;
  #termRef = createRef<HTMLElement>();
  #fitAddon = new FitAddon();
  #observer: ResizeObserver;
  #session: Promise<symbol> | undefined;

  constructor() {
    super();
    this.#xterm = new XTerm();
    this.#xterm.onBinary((a) => {
      console.error("***", a);
    });
    this.#xterm.onData((data) => {
      this.#session?.then((s) => this.api?.sendData(s, data));
    });
    this.#xterm.loadAddon(this.#fitAddon);
    const pd = this.#fitAddon.proposeDimensions.bind(this.#fitAddon);
    this.#fitAddon.proposeDimensions = () => {
      const dim = pd();
      if (dim) {
        // dim.rows++;
        dim.cols++;
      }
      return dim;
    };
    this.#observer = new ResizeObserver(this.#updateDimensions);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#observer.observe(this);
    this.#session = this.api?.createSession("zsh", "~", this.#onData, { rows: 120, cols: 80 });
  }

  disconnectedCallback() {
    this.#observer.unobserve(this);
    super.disconnectedCallback();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    if (this.#termRef.value) {
      this.#xterm.open(this.#termRef.value);
      this.#fitAddon.fit();

      // this.#xterm.write("\r\n");
    }
  }

  #onData = (data: string) => {
    if (this.#waitForPrompt) {
      const prompt = data.split("/n").at(-1);
      if (prompt && prompt.includes("\x1b[J")) {
        console.error(prompt);
        this.#xterm.write(`\r${prompt}`);
        this.#waitForPrompt = false;
      }
      return;
    }
    this.#xterm.write(data);
  };

  #updateDimensions = () => {
    this.#fitAddon.fit();
    this.#session?.then((s) => {
      this.api?.setTtySize(s, { rows: this.#xterm.rows, cols: this.#xterm.cols });
    });
  };

  protected render(): unknown {
    return html`<div class="root" ref=${ref(this.#termRef)}></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: Terminal;
  }
}
