import type { FileSystemProvider, Theme } from "@frdy/sdk";

export interface WebViewActions {
  setTheme(theme: Theme): Promise<void>;
  setScript(script: string): Promise<void>;
  setContent(params: { content?: Uint8Array; path?: string }): Promise<void>;
  setActiveFilepath(filepath: string | undefined): Promise<void>;
}

export interface WebView {
  getNamedPort(name: string): MessagePort;
}

export interface WebViewEvents {
  onFocus(): Promise<void>;
}

export type WebViewFs = FileSystemProvider;
