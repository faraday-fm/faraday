import clsx from "clsx";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { TabSetLayout } from "../../types";
import React from "react";
import { createComponent } from "@lit/react";
import "./TabLit";

const TAG = "frdy-tabs";

@customElement(TAG)
export class Tabs extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    .tabs {
      box-sizing: border-box;
      overflow: hidden;
      width: 100%;
      height: 100%;
      border: 1px solid var(--panel-border);
      display: grid;
      grid-template-rows: auto 1fr;
    }
    .tabsHeader {
      display: flex;
      color: var(--panel-header-foreground);
      background-color: var(--panel-header-background);
      overflow: hidden;
    }
    .tabName {
      cursor: pointer;
      padding-left: 1ch;
      &:hover {
        color: var(--panel-header-foreground-focus);
        background-color: var(--panel-header-background-focus);
      }
      &.-active {
        color: var(--panel-header-foreground-focus);
        background-color: var(--panel-header-background-focus);
      }
    }
  `;

  @property({ attribute: false })
  accessor layout: TabSetLayout | undefined;

  @property({ attribute: false })
  accessor setLayout: ((newLayout: TabSetLayout) => void) | undefined;

  protected render() {
    if (!this.layout) {
      return nothing;
    }

    return html`
      <div class="tabs" tabindex="0">
        <div class="tabsHeader">
          ${repeat(
            this.layout.children,
            (tab) => tab.id,
            (tab) => html`<div class=${clsx("tabName", this.layout?.activeTabId === tab.id && "-active")}>${tab.name}</div>`
          )}
        </div>
        <frdy-tab .layout=${this.layout!.children[0]}></frdy-tab>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: Tabs;
  }
}

export const TabsReact = createComponent({
  tagName: TAG,
  elementClass: Tabs,
  react: React,
});
