import { command, CommandsProvider, context } from "@frdy/commands";
import { FileSystemProvider } from "@frdy/sdk";
import { ContextProvider } from "@lit/context";
import { Task } from "@lit/task";
import { signal } from "@preact/signals-core";
import { parse as jsonParse } from "jsonc-parser";
import { css, html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import keybindings from "../assets/keybindings.json";
import * as v from "../css";
import { createCssVarsProvider } from "../contexts/cssVarsProvider";
import { createExtensionsProvider } from "../contexts/extensionContext";
import { createExtensionRepoProvider } from "../contexts/extensionRepoContext";
import { fsContext } from "../contexts/fsContext";
import { readFileString } from "../contexts/fsUtils";
import { createIconThemeProvider } from "../contexts/iconThemeContext";
import { createIconsCache } from "../contexts/iconsCacheContext";
import { IsTouchScreenContext } from "../contexts/isTouchScreenContext";
import { createSettingsContextProvider } from "../contexts/settingsContext";
import { createThemeProvider } from "../contexts/themeContext";
import { FaradayHost, NodeLayout } from "../types";
import "./ActionBar";
import "../terminal/terminal";
import { FrdyElement } from "./FrdyElement";
import "./Tabs/LayoutContainer";

const TAG = "frdy-app";

@customElement(TAG)
export class FrdyApp extends FrdyElement {
  static styles = css`
    :host {
      display: contents;
      font-size: 14px;
      font-family: ${v.fontFamily};
      /* font-family: var(--fontFamily, "SF Mono", Monaco, Menlo, Courier, monospace); */
      color: ${v.foreground};
    }

    .app {
      /* -webkit-font-smoothing: antialiased; */

      ::-webkit-scrollbar {
        display: none;
      }

      & :is(button, input) {
        font-family: inherit;
        text-rendering: inherit;
        font-size: inherit;
      }

      text-rendering: geometricPrecision;
      background-color: ${v.panel_background};
      height: 100%;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      flex-direction: column;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      cursor: default;
    }

    .main {
      display: grid;
      grid-template-rows: 4fr 1fr;
      position: relative;
      overflow: hidden;
    }
    .tabs {
      display: grid;
      left: 0;
      right: 0;
      top: 0;
      bottom: 17px;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      z-index: 0;
    }
    .terminal {
      display: grid;
      overflow: hidden;
      inset: 0;
      z-index: 0;
      background-color: var(--terminal-background);
    }
    .footerDiv {
      grid-row: 2;
      overflow: hidden;
    }
  `;

  #fs = signal<FileSystemProvider>();
  #fsProvider = new ContextProvider(this, { context: fsContext });
  #settingsProvider = createSettingsContextProvider(this, this.#fs);
  #extensionRepoProvider = createExtensionRepoProvider(this, this.#fs);
  #extensionsProvider = createExtensionsProvider(this, this.#fs, this.#extensionRepoProvider.extensionRepoSignal);
  #themeProvider = createThemeProvider(this, this.#fs, this.#extensionsProvider.extensionsSignal, this.#settingsProvider.settingsSignal);
  #iconThemeProvider = createIconThemeProvider(this, this.#fs, this.#extensionsProvider.extensionsSignal, this.#settingsProvider.settingsSignal);
  #iconsCacheProvider = createIconsCache(this, this.#fs, this.#iconThemeProvider.iconThemeSignal, this.#extensionsProvider.extensionsSignal);
  private _commandsProvider = new CommandsProvider(this, keybindings);
  private _css = createCssVarsProvider(this, this.#themeProvider.themeSignal);
  private _isTouchScreenProvider = new IsTouchScreenContext(this);

  @property({ attribute: false })
  accessor host: FaradayHost | undefined;

  @context({ name: "isDesktop" })
  accessor isDesktop = false;

  @context({ name: "devMode" })
  accessor devMode = false;

  @command()
  togglePanels() {
    // setPanelsOpen((p) => !p)
  }

  @command()
  copyFiles() {
    // setCopyDialogOpen(true)
  }

  @command()
  deleteFiles() {
    // setDeleteDialogOpen(true)
  }

  @command()
  switchDevMode() {
    console.error("SWITCH");
    this.devMode = !this.devMode;
  }

  @state()
  private accessor layout: NodeLayout | undefined;

  constructor() {
    super();
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("host")) {
      const fs = this.host?.rootFs;
      if (fs) {
        this.#fs.value = fs;
        this.#fsProvider.setValue(fs);
      }
    }
  }

  #layoutTask = new Task(this, {
    task: async ([fs]) => {
      if (!fs) {
        return undefined;
      }
      const layout: NodeLayout = jsonParse(await readFileString(fs, ".config/faraday/layout.json")) as any;
      this.layout = layout;
      return layout;
    },
    args: () => [this.#fsProvider.value] as const,
  });

  protected render() {
    return this.#layoutTask.render({
      complete: () => html`
        <div class="app">
          <div class="main">
            <div class="tabs">
              ${when(
                this.layout,
                () =>
                  html`<frdy-layout-container
                    .layout=${this.layout}
                    direction="h"
                    .setLayout=${(l: NodeLayout) => {
                      this.layout = l;
                    }}
                  ></frdy-layout-container>`
              )}
            </div>
            <div class="terminal">
              <frdy-terminal .api=${this.host?.terminal}></frdy-terminal>
            </div>
          </div>
          <div class="footerDiv">
            <frdy-action-bar></frdy-action-bar>
          </div>
        </div>
      `,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FrdyApp;
  }
}
