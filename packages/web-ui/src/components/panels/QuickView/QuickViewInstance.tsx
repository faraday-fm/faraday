import webViewHtml from "@frdy/webview-host/index.html";
import { forwardRef, memo, useImperativeHandle, useRef, useState } from "react";
import type { FullyQualifiedQuickView } from "../../../features/extensions/types";
import { css } from "../../../features/styles";
import { useRemoteWebView } from "./remoteWebView";

const webviewUrl = URL.createObjectURL(new Blob([webViewHtml], { type: "text/html" }));

export interface QuickViewInstanceActions {
  setIsActive(isActive: boolean): void;
}

export type QuickViewInstanceProps = {
  quickView: FullyQualifiedQuickView;
};

export const QuickViewInstance = memo(
  forwardRef<QuickViewInstanceActions, QuickViewInstanceProps>(({ quickView }, ref) => {
    const isActiveRef = useRef(true);
    useImperativeHandle(
      ref,
      () => ({
        setIsActive(isActive) {
          if (isActiveRef.current !== isActive) {
            isActiveRef.current = isActive;
            setIsVisible(isActive);
            webview.setIsActive(isActive);
          }
        },
      }),
      [],
    );

    const [extensionPath] = useState(quickView.extensionPath);
    const [scriptPath] = useState(quickView.quickView.path);
    const [isVisible, setIsVisible] = useState(true);
    const [iframe, setIframe] = useState<HTMLIFrameElement>();
    const webview = useRemoteWebView(iframe, extensionPath, scriptPath);

    return (
      <iframe
        className={css("quick-view-web-view")}
        style={{ display: isVisible ? "block" : "none" }}
        sandbox="allow-scripts"
        tabIndex={0}
        title="Quick View"
        src={webviewUrl}
        onLoad={(e) => setIframe(e.currentTarget)}
      />
    );
  }),
);
