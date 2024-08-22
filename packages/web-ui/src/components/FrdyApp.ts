import { command, CommandsProvider, context } from "@frdy/commands";
import { ContextProvider } from "@lit/context";
import { createComponent } from "@lit/react";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import keybindings from "../assets/keybindings.json";
import { createExtensionsContext, extensionsContext } from "../lit-contexts/extensionContext";
import { createExtensionRepoContext, extensionRepoContext } from "../lit-contexts/extensionRepoContext";
import { fsContext } from "../lit-contexts/fsContext";
import { createIconThemeContext, iconThemeContext } from "../lit-contexts/iconThemeContext";
import { createIconsCache, iconsCacheContext } from "../lit-contexts/iconsCacheContext";
import { createSettingsContext, settingsContext } from "../lit-contexts/settingsContext";
import { FaradayHost } from "../types";

const TAG = "frdy-app";

@customElement(TAG)
export class FrdyApp extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  private _fsProvider = new ContextProvider(this, { context: fsContext });
  private _settingsProvider = new ContextProvider(this, { context: settingsContext });
  private _extensionRepoProvider = new ContextProvider(this, { context: extensionRepoContext });
  private _extensionsProvider = new ContextProvider(this, { context: extensionsContext });
  private _iconThemeProvider = new ContextProvider(this, { context: iconThemeContext });
  private _iconsCacheProvider = new ContextProvider(this, { context: iconsCacheContext });
  private _commandsProvider = new CommandsProvider(this, keybindings);

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

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: FrdyApp;
  }
}

export const FrdyAppReact = createComponent({
  tagName: TAG,
  elementClass: FrdyApp,
  react: React,
});
