import type { FileSystemProvider, Theme } from "@frdy/sdk";
import type { WebView, WebViewActions, WebViewHost } from "@frdy/webview-host/types";
import * as Comlink from "comlink";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFs } from "../../../features/fs/useFs";
import { useGlobalContext } from "../../../features/globalContext";
import { useTheme } from "../../../features/themes";

type RemoteWebViewParams = {
  window: Window;
  pwd: string;
  scriptPath: string;
  fs: FileSystemProvider;
  onFocus: () => void;
};

export async function remoteWebView({ window: w, fs, pwd, scriptPath, onFocus }: RemoteWebViewParams) {
  const ep = Comlink.windowEndpoint(w);
  const wv = Comlink.wrap<WebView>(ep);

  const hostChannel = new MessageChannel();
  const host: WebViewHost = {
    getSettings: () => ({ pwd, scriptPath }),
    onFocus,
  };
  Comlink.expose(host, hostChannel.port1);

  const fsChannel = new MessageChannel();
  Comlink.expose(fs, fsChannel.port1);

  const remotePorts = await wv.getPorts();

  await wv.setPorts(Comlink.transfer({ fs: fsChannel.port2, host: hostChannel.port2 }, [fsChannel.port2, hostChannel.port2]));

  return Comlink.wrap<WebViewActions>(remotePorts.actions);
}

export function useRemoteWebView(iframe: HTMLIFrameElement | undefined, pwd: string, scriptPath: string) {
  const { "filePanel.path": activeFilePath } = useGlobalContext();
  const theme = useTheme();
  const initialPath = useRef(activeFilePath);
  const initialTheme = useRef(theme);
  const fs = useFs();
  const webviewRef = useRef<Comlink.Remote<WebViewActions>>();

  useEffect(() => {
    if (iframe?.contentWindow) {
      remoteWebView({ window: iframe.contentWindow, fs, pwd, scriptPath, onFocus: () => iframe.focus() }).then(async (wv) => {
        webviewRef.current = wv;
        await wv.setActiveFilepath(initialPath.current ?? "");
        await wv.setTheme(initialTheme.current);
        await wv.loadScript();
        await wv.setIsActive(true);
      });
    }
  }, [iframe, pwd, scriptPath, fs]);

  useEffect(() => {
    webviewRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    webviewRef.current?.setActiveFilepath(activeFilePath);
  }, [activeFilePath]);

  return useMemo(
    () => ({
      setIsActive(isActive: boolean) {
        webviewRef.current?.setIsActive(isActive);
      },
    }),
    [],
  );
}
