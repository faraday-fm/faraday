import quickViewHtml from "@frdy/webview-host/index.html";
import type { WebViewActions, WebViewEvents } from "@frdy/webview-host/types";
import * as Comlink from "comlink";
import { type ForwardedRef, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { css } from "../../features/styles";
import { useTheme } from "../../features/themes";
import { useComlinkExpose } from "../../hooks/useComlinkExpose";
import { useComlinkRemote } from "../../hooks/useComlinkRemote";

export interface QuickViewFrameActions {
  setContent({ content, path }: { content?: Uint8Array; path?: string }): Promise<void>;
  setVisibility(show: boolean): Promise<void>;
}

const quickViewHtmlBase64 = btoa(quickViewHtml);

export const QuickViewFrame = forwardRef(function QuickViewFrame({ script }: { script: string }, ref: ForwardedRef<QuickViewFrameActions>) {
  const [initialScript] = useState(script);
  const [wnd, setWnd] = useState<Window>();
  const themeSetPromise = useRef(Promise.withResolvers<void>());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useTheme();

  if (script !== initialScript) {
    throw new Error("'script' should not be changed.");
  }

  const remoteRef = useComlinkRemote<WebViewActions>(wnd);
  useComlinkExpose(
    wnd,
    useMemo(
      () =>
        ({
          onFocus() {
            iframeRef.current?.focus();
          },
        }) as WebViewEvents,
      [],
    ),
  );

  useImperativeHandle(
    ref,
    () => ({
      async setContent({ content, path }) {
        await themeSetPromise.current.promise;
        if (content?.buffer) {
          remoteRef.current?.setContent(Comlink.transfer({ content, path }, [content.buffer]));
        } else {
          remoteRef.current?.setContent({ content, path });
        }
      },
      async setVisibility(show) {
        if (iframeRef.current) {
          if (show) {
            iframeRef.current.style.removeProperty("display");
          } else if (iframeRef.current.style.display !== "none") {
            iframeRef.current.style.display = "none";
            await themeSetPromise.current.promise;
            remoteRef.current?.setContent({});
          }
        }
      },
    }),
    [remoteRef],
  );

  useEffect(() => {
    if (wnd) {
      remoteRef.current?.setScript(initialScript);
    }
  }, [wnd, remoteRef, initialScript]);

  useEffect(() => {
    if (wnd) {
      remoteRef.current?.setTheme(theme);
      themeSetPromise.current.resolve();
    }
  }, [wnd, remoteRef, theme]);

  return (
    <iframe
      className={css("quick-view-web-view")}
      ref={iframeRef}
      sandbox="allow-scripts"
      tabIndex={0}
      title="quick view"
      src={`data:text/html;base64,${quickViewHtmlBase64}`}
      onLoad={(e) => setWnd(e.currentTarget.contentWindow ?? undefined)}
    />
  );
});
