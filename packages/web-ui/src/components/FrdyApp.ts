import { ContextProvider } from "@lit/context";
import { createComponent } from "@lit/react";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import React from "react";
import { fsContext } from "../lit-contexts/fsContext";
import { createSettingsContext, settingsContext } from "../lit-contexts/settingsContext";
import { createExtensionRepoContext, extensionRepoContext } from "../lit-contexts/extensionRepoContext";
import { createExtensionsContext, extensionsContext } from "../lit-contexts/extensionContext";
import { createIconThemeContext, iconThemeContext } from "../lit-contexts/iconThemeContext";
import { createIconsCache, iconsCacheContext } from "../lit-contexts/iconsCacheContext";
import { FileSystemProvider } from "@frdy/sdk";

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

  public setFs(fs: FileSystemProvider) {
    if (!this._fsProvider.value) {
      this._fsProvider.setValue(fs);
      this._settingsProvider.setValue(createSettingsContext(fs));
      this._extensionRepoProvider.setValue(createExtensionRepoContext(fs));
      this._extensionsProvider.setValue(createExtensionsContext(fs, this._extensionRepoProvider.value));
      this._iconThemeProvider.setValue(createIconThemeContext(fs, this._settingsProvider.value, this._extensionsProvider.value));
      this._iconsCacheProvider.setValue(createIconsCache(fs, this._iconThemeProvider.value));
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
