import * as Comlink from "comlink";
import type { WebView, WebViewActions, WebViewHost } from "@frdy/webview-host/types";
import type { FileSystemProvider, Theme } from "@frdy/sdk";
import { useGlobalContext } from "../../../features/globalContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFs } from "../../../features/fs/useFs";
import { useTheme } from "../../../features/themes";

type RemoteWebViewParams = {
  window: Window;
  pwd: string;
  scriptPath: string;
  fs: FileSystemProvider;
  onFocus: () => void;
};

export type RemoteWebView = {
  setTheme(theme: Theme): void;
  setActiveFilePath(path: string): void;
  setIsActive(isActive: boolean): void;
  start(): void;
};

export async function remoteWebView({ window: w, fs, pwd, scriptPath, onFocus }: RemoteWebViewParams): Promise<RemoteWebView> {
  const ep = Comlink.windowEndpoint(w);
  const wv = Comlink.wrap<WebView>(ep);
  let activeFilepath: string;
  let theme: Theme;

  const hostChannel = new MessageChannel();
  const host: WebViewHost = {
    getSettings: () => ({ activeFilepath, theme, pwd, scriptPath }),
    onFocus,
  };
  Comlink.expose(host, hostChannel.port1);

  const fsChannel = new MessageChannel();
  Comlink.expose(fs, fsChannel.port1);

  const remotePorts = await wv.getPorts();

  const start = async () => {
    await wv.setPorts(Comlink.transfer({ fs: fsChannel.port2, host: hostChannel.port2 }, [fsChannel.port2, hostChannel.port2]));
  };

  const actions = Comlink.wrap<WebViewActions>(remotePorts.actions);
  return {
    setActiveFilePath: actions.setActiveFilepath,
    setTheme: actions.setTheme,
    setIsActive: actions.setIsActive,
    start,
  };
}

export function useRemoteWebView(iframe: HTMLIFrameElement | undefined, pwd: string, scriptPath: string) {
  const { "filePanel.path": activeFilePath } = useGlobalContext();
  const theme = useTheme();
  const initialPath = useRef(activeFilePath);
  const initialTheme = useRef(theme);
  const fs = useFs();
  const [webview, setWebview] = useState<RemoteWebView>();
  const webviewRef = useRef(webview);
  webviewRef.current = webview;

  useEffect(() => {
    if (iframe?.contentWindow) {
      remoteWebView({ window: iframe.contentWindow, fs, pwd, scriptPath, onFocus: () => iframe.focus() }).then((wv) => {
        setWebview(wv);
        wv.setActiveFilePath(initialPath.current ?? "");
        wv.setTheme(initialTheme.current);
        wv.start();
      });
    }
  }, [iframe, pwd, scriptPath, fs]);

  useEffect(() => {
    if (webview) {
      webview.setTheme(theme);
    }
  }, [webview, theme]);

  useEffect(() => {
    if (webview && activeFilePath) {
      webview.setActiveFilePath(activeFilePath);
    }
  }, [webview, activeFilePath]);

  return useMemo(
    () => ({
      setIsActive(isActive: boolean) {
        webviewRef.current?.setIsActive(isActive);
      },
    }),
    [],
  );
}
