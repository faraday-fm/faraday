import webViewHtml from "@frdy/webview-host/index.html";
import { forwardRef, memo, useImperativeHandle, useRef, useState } from "react";
import { css } from "../../../features/styles";
import { useRemoteWebView } from "./remoteWebView";

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

    const [isVisible, setIsVisible] = useState(true);
    const [initialPwdPath] = useState(pwdPath);
    const [initialScriptPath] = useState(scriptPath);
    const [iframe, setIframe] = useState<HTMLIFrameElement>();
    const webview = useRemoteWebView(iframe, initialPwdPath, initialScriptPath);

    if (scriptPath !== initialScriptPath) {
      throw new Error("'scriptPath' prop must not be changed.");
    }

    return (
      <iframe
        className={css("quick-view-web-view")}
        style={{ display: isVisible ? "block" : "none" }}
        sandbox="allow-scripts"
        tabIndex={0}
        title="quick view"
        src={`data:text/html;base64,${webViewHtmlBase64}`}
        onLoad={(e) => setIframe(e.currentTarget)}
      />
    );
  }),
);
