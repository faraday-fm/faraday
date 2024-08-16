import { FileType, type Dirent, type FileSystemProvider } from "@frdy/sdk";
import { ContextProvider } from "@lit/context";
import { createComponent } from "@lit/react";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import React from "react";
import "./FileName";
import { fsContext } from "./contexts/fsContext";
import { createIconsCache, iconsCacheContext } from "./contexts/iconsCacheContext";

@customElement("frdy-app")
export class App extends LitElement {
  private _fsProvider = new ContextProvider(this, { context: fsContext });
  private _iconsCacheProvider = new ContextProvider(this, { context: iconsCacheContext });

  public setFs(fs: FileSystemProvider) {
    this._fsProvider.setValue(fs);
    this._iconsCacheProvider.setValue(createIconsCache(fs));
  }

  protected render() {
    const dirent: Dirent = {filename: "svg.svg", path:"/sss/svg.svg", attrs: {type: FileType.Regular}}
    return html`
      <div><frdy-filename .dirent=${dirent}></frdy-filename></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "frdy-app": App;
  }
}

export const AppReact = createComponent({
  tagName: "frdy-app",
  elementClass: App,
  react: React,
  events: {
    onactivate: "activate",
    onchange: "change",
  },
});
