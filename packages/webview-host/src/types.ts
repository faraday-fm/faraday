import type { Theme } from "@frdy/sdk";

export interface WebViewActions {
  setTheme(theme: Theme): Promise<void>;
  setScript(script: string): Promise<void>;
  setContent(params: { content?: Uint8Array; path?: string }): Promise<void>;
}

export interface WebViewEvents {
  onFocus(): Promise<void>;
}
