import { command, CommandsProvider, context } from "@frdy/commands";
import { ContextProvider } from "@lit/context";
import { Task } from "@lit/task";
import JSON5 from "json5";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import keybindings from "../assets/keybindings.json";
import { darkTheme } from "../features/themes/themes";
import { CssVarsProvider } from "../lit-contexts/CssVarsProvider";
import { createExtensionsContext, extensionsContext } from "../lit-contexts/extensionContext";
import { createExtensionRepoContext, extensionRepoContext } from "../lit-contexts/extensionRepoContext";
import { fsContext } from "../lit-contexts/fsContext";
import { readFileString } from "../lit-contexts/fsUtils";
import { createIconThemeContext, iconThemeContext } from "../lit-contexts/iconThemeContext";
import { createIconsCache, iconsCacheContext } from "../lit-contexts/iconsCacheContext";
import { createSettingsContext, settingsContext } from "../lit-contexts/settingsContext";
import { FaradayHost, NodeLayout } from "../types";
import "./ActionBar";
import "./Tabs/LayoutContainer";

const TAG = "frdy-app";

@customElement(TAG)
export class FrdyApp extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .app {
      -webkit-font-smoothing: antialiased;

      ::-webkit-scrollbar {
        display: none;
      }

      & :is(button, input) {
        font-family: inherit;
        text-rendering: inherit;
        font-size: inherit;
      }

      font-family: var(--fontFamily);
      text-rendering: geometricPrecision;
      background-color: #172637;
      height: 100%;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      flex-direction: column;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      cursor: default;
    }

    .mainDiv {
      grid-row: 1;
      position: relative;
      overflow: hidden;
    }

    .terminalContainer {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .tabs {
      display: grid;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 17px;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      z-index: 0;
    }
    .footerDiv {
      grid-row: 2;
      overflow: hidden;
    }
  `;

  private _fsProvider = new ContextProvider(this, { context: fsContext });
  private _settingsProvider = new ContextProvider(this, { context: settingsContext });
  private _extensionRepoProvider = new ContextProvider(this, { context: extensionRepoContext });
  private _extensionsProvider = new ContextProvider(this, { context: extensionsContext });
  private _iconThemeProvider = new ContextProvider(this, { context: iconThemeContext });
  private _iconsCacheProvider = new ContextProvider(this, { context: iconsCacheContext });
  private _commandsProvider = new CommandsProvider(this, keybindings);
  private _css = new CssVarsProvider(this);

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
  focusNextPanel() {
    // focusNextPanel(false)
  }

  @command()
  focusPrevPanel() {
    // focusNextPanel(true)
  }

  @command()
  open() {
    // enterDir()
  }

  @command()
  openShell() {
    // setCopyDialogOpen(true)
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

  @command()
  switchShowHiddenFiles() {
    // setShowHiddenFiles((d) => !d)
  }

  @state()
  private accessor layout: NodeLayout | undefined;

  constructor() {
    super();
    this._css.setTheme(darkTheme);
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("host")) {
      const fs = this.host?.rootFs;
      if (fs) {
        this._fsProvider.setValue(fs);
        this._settingsProvider.setValue(createSettingsContext(fs));
        this._extensionRepoProvider.setValue(createExtensionRepoContext(fs));
        this._extensionsProvider.setValue(createExtensionsContext(fs, this._extensionRepoProvider.value));
        this._iconThemeProvider.setValue(createIconThemeContext(fs, this._settingsProvider.value, this._extensionsProvider.value));
        this._iconsCacheProvider.setValue(createIconsCache(fs, this._iconThemeProvider.value));
      }
    }
  }

  #layoutTask = new Task(this, {
    task: async ([fs]) => {
      const layout: NodeLayout = JSON5.parse(await readFileString(fs, ".faraday/layout.json")) as any;
      this.layout = layout;
      return layout;
    },
    args: () => [this._fsProvider.value] as const,
  });

  protected render() {
    return this.#layoutTask.render({
      complete: () => html`
        <div class="app">
          <div class="mainDiv">
            <div class="terminalContainer"></div>
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

// export const FrdyAppReact = createComponent({
//   tagName: TAG,
//   elementClass: FrdyApp,
//   react: React,
// });
