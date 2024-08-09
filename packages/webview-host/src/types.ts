import type { FileSystemProvider, Theme } from "@frdy/sdk";

export interface WebViewActions {
  setTheme(theme: Theme): Promise<void>;
  setScriptPath(pwdPath: string, scriptPath: string): Promise<void>;
  setActiveFilepath(filepath: string | undefined): Promise<void>;
}

export interface WebView {
  getNamedPort(name: string): MessagePort;
}

export interface WebViewEvents {
  onFocus(): Promise<void>;
}

export type WebViewFs = FileSystemProvider;
