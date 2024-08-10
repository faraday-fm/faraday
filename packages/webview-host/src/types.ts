import type { FileSystemProvider, Theme } from "@frdy/sdk";

export interface WebViewActions {
  setIsActive(isActive: boolean): void;
  setTheme(theme: Theme): void;
  setActiveFilepath(filepath: string | undefined): void;
  loadScript(): void;
}

export interface WebView {
  setPorts({ host, fs }: { host: MessagePort; fs: MessagePort }): void;
  getPorts(): { actions: MessagePort };
}

export interface WebViewHost {
  onFocus(): void;
  getSettings(): {
    pwd: string;
    scriptPath: string;
  };
}

export type WebViewFs = FileSystemProvider;
