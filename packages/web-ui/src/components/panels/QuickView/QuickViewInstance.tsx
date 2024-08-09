import webViewHtml from "@frdy/webview-host/index.html";
import type { WebView, WebViewActions, WebViewEvents } from "@frdy/webview-host/types";
import * as Comlink from "comlink";
import { type ForwardedRef, forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useFs } from "../../../features/fs/useFs";
import { useGlobalContext } from "../../../features/globalContext";
import { css } from "../../../features/styles";
import { useTheme } from "../../../features/themes";
import { useComlinkExpose } from "../../../hooks/useComlinkExpose";
import { useComlinkRemote } from "../../../hooks/useComlinkRemote";
import { useNamedChannels } from "../../../hooks/useNamedChannels";

export interface QuickViewInstanceActions {
  setIsActive(isActive: boolean): void;
}

const webViewHtmlBase64 = window.btoa(webViewHtml);

type QuickViewInstanceProps = {
  pwdPath: string;
  scriptPath: string;
};

export const QuickViewInstance = memo(
  forwardRef<QuickViewInstanceActions, QuickViewInstanceProps>(({ pwdPath, scriptPath }, ref) => {
    useImperativeHandle(
      ref,
      () => ({
        setIsActive(isActive) {
          setIsVisible(isActive);
        },
      }),
      [],
    );

    const [isVisible, setIsVisible] = useState(true);
    const [initialPwdPath] = useState(pwdPath);
    const [initialScriptPath] = useState(scriptPath);
    const [wnd, setWnd] = useState<Window>();
    const themeSetPromise = useRef(Promise.withResolvers<void>());
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const theme = useTheme();
    const fs = useFs();
    const getNamedChannel = useNamedChannels();
    const { "filePanel.path": path } = useGlobalContext();

    if (scriptPath !== initialScriptPath) {
      throw new Error("'scriptPath' prop must not be changed.");
    }

    const portExposed = useComlinkExpose(
      wnd,
      useMemo(
        () =>
          ({
            getNamedPort: (name) => {
              const p = getNamedChannel(name).port2;
              return Comlink.transfer(p, [p]);
            },
          }) satisfies WebView,
        [getNamedChannel],
      ),
    );

    useComlinkExpose(getNamedChannel("fs").port1, fs);

    const actionsRef = useComlinkRemote<WebViewActions>(getNamedChannel("actions").port1);

    useComlinkExpose(
      getNamedChannel("events").port1,
      useMemo(
        () =>
          ({
            async onFocus() {
              iframeRef.current?.focus();
            },
          }) satisfies WebViewEvents,
        [],
      ),
    );

    useEffect(() => {
      if (portExposed) {
        actionsRef.current?.setActiveFilepath(path);
      }
    }, [portExposed, actionsRef, path]);

    useEffect(() => {
      if (portExposed) {
        actionsRef.current?.setScriptPath(initialPwdPath, initialScriptPath);
      }
    }, [portExposed, actionsRef, initialPwdPath, initialScriptPath]);

    useEffect(() => {
      if (portExposed) {
        actionsRef.current?.setTheme(theme);
        themeSetPromise.current.resolve();
      }
    }, [portExposed, actionsRef, theme]);

    return (
      <iframe
        className={css("quick-view-web-view")}
        ref={iframeRef}
        style={{ display: isVisible ? "block" : "none" }}
        sandbox="allow-scripts"
        tabIndex={0}
        title="quick view"
        src={`data:text/html;base64,${webViewHtmlBase64}`}
        onLoad={(e) => setWnd(e.currentTarget.contentWindow ?? undefined)}
      />
    );
  }),
);
