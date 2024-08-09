import quickViewHtml from "@frdy/webview-host/index.html";
import type { WebView, WebViewActions, WebViewEvents } from "@frdy/webview-host/types";
import * as Comlink from "comlink";
import { type ForwardedRef, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useFs } from "../../features/fs/useFs";
import { css } from "../../features/styles";
import { useTheme } from "../../features/themes";
import { useComlinkExpose } from "../../hooks/useComlinkExpose";
import { useComlinkRemote } from "../../hooks/useComlinkRemote";
import { useNamedChannels } from "../../hooks/useNamedChannels";

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
  const fs = useFs();
  const getNamedChannel = useNamedChannels();

  if (script !== initialScript) {
    throw new Error("'script' should not be changed.");
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

  // useComlinkExpose(wnd, fs);

  useImperativeHandle(
    ref,
    () => ({
      async setContent({ content, path }) {
        await themeSetPromise.current.promise;
        if (content?.buffer) {
          actionsRef.current?.setContent(Comlink.transfer({ content, path }, [content.buffer]));
        } else {
          actionsRef.current?.setContent({ content, path });
        }
      },
      async setVisibility(show) {
        if (iframeRef.current) {
          if (show) {
            iframeRef.current.style.removeProperty("display");
          } else if (iframeRef.current.style.display !== "none") {
            iframeRef.current.style.display = "none";
            await themeSetPromise.current.promise;
            actionsRef.current?.setContent({});
          }
        }
      },
    }),
    [actionsRef],
  );

  useEffect(() => {
    if (portExposed) {
      actionsRef.current?.setScript(initialScript);
    }
  }, [portExposed, actionsRef, initialScript]);

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
      sandbox="allow-scripts"
      tabIndex={0}
      title="quick view"
      src={`data:text/html;base64,${quickViewHtmlBase64}`}
      onLoad={(e) => setWnd(e.currentTarget.contentWindow ?? undefined)}
    />
  );
});
