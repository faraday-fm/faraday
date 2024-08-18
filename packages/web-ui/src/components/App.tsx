import { useCommandBinding, useSetContextVariable } from "@frdy/commands";
import JSON5 from "json5";
import { useEffect, useRef, useState } from "react";
import defaultLayout from "../assets/layout.json";
import { ActionsBar } from "../components/ActionsBar";
import { LayoutContainer } from "../components/LayoutContainer";
import { useFaradayHost } from "../contexts/faradayHostContext";
import { useGlyphSize } from "../contexts/glyphSizeContext";
import { useFileContent, useFs } from "../features/fs/hooks";
import { usePanels } from "../features/panels";
import type { TabLayout } from "../types";
import CopyDialog from "./dialogs/CopyDialog";
import DeleteDialog from "./dialogs/DeleteDialog";
import { useSettings } from "../features/settings/settings";
import { css } from "@css";
import { FrdyAppReact } from "./FrdyApp";

const app = css`
  -webkit-font-smoothing: antialiased;

  ::-webkit-scrollbar {
    display: none;
  }

  /* font-size: 13.5px; */

  & :is(button, input) {
    font-family: inherit;
    text-rendering: inherit;
    font-size: inherit;
  }

  font-family: var(--fontFamily);
  text-rendering: geometricPrecision;
  background-color: #172637;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  flex-direction: column;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  cursor: default;
`;
const mainDiv = css`
  grid-row: 1;
  position: relative;
  overflow: hidden;
`;
const terminalContainer = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
`;
const tabsContainer = css`
  display: grid;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 17px;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  z-index: 0;
`;
const footerDiv = css`
  grid-row: 2;
  overflow: hidden;
`;

// const Terminal = lazy(() => import("@components/Terminal/Terminal"));

const decoder = new TextDecoder();

export function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [executing] = useState(false);
  const { layout, setLayout, focusNextPanel, enterDir } = usePanels();
  const host = useFaradayHost();
  const [devMode, setDevMode] = useState(false);
  const { setShowHiddenFiles } = useSettings();
  const fs = useFs();

  const { content: layoutContent, error: layoutLoadingError } = useFileContent(".faraday/layout.json");
  useEffect(() => {
    if (layoutContent) {
      try {
        console.info("Loading layout...");
        const layout: TabLayout = JSON5.parse(decoder.decode(layoutContent));
        console.info("Loaded layout.");
        setLayout(layout);
      } catch {
        setLayout(defaultLayout as any);
      }
    } else if (layoutLoadingError) {
      setLayout(defaultLayout as any);
    }
  }, [layoutContent, layoutLoadingError, setLayout]);

  useSetContextVariable("isDesktop", true, host.config.isDesktop());
  useSetContextVariable("devMode", true, devMode);

  useCommandBinding("togglePanels", () => setPanelsOpen((p) => !p));
  useCommandBinding("focusNextPanel", () => focusNextPanel(false));
  useCommandBinding("focusPrevPanel", () => focusNextPanel(true));
  useCommandBinding("open", () => enterDir());
  useCommandBinding("openShell", () => setCopyDialogOpen(true));
  useCommandBinding("copyFiles", () => setCopyDialogOpen(true));
  useCommandBinding("deleteFiles", () => setDeleteDialogOpen(true));
  useCommandBinding("switchDevMode", () => setDevMode((d) => !d));
  useCommandBinding("switchShowHiddenFiles", () => setShowHiddenFiles((d) => !d));

  // const leftItems = useMemo(() => Array.from(Array(300).keys()).map((i) => ({ name: i.toString(), size: Math.round(Math.random() * 100000000) })), []);
  const { height: glyphHeight } = useGlyphSize();

  // const onRunStart = useCallback(() => setExecuting(true), []);
  // const onRunEnd = useCallback(() => setExecuting(false), []);

  if (!layout) {
    return null;
  }

  return (
    <FrdyAppReact ref={(r) => r?.setFs(fs)}>
      <div className={app} ref={rootRef}>
        <div className={mainDiv}>
          <div className={terminalContainer}>
            {/* <Suspense fallback={<div />}>
              <Terminal fullScreen={!panelsOpen} onRunStart={onRunStart} onRunEnd={onRunEnd} />
            </Suspense> */}
          </div>
          <div
            className={tabsContainer}
            style={{
              opacity: !executing && panelsOpen ? 1 : 0,
              pointerEvents: !executing && panelsOpen ? "all" : "none",
              bottom: glyphHeight,
            }}
          >
            {layout && <LayoutContainer layout={layout} direction="h" setLayout={setLayout} />}
          </div>
        </div>
        <div className={footerDiv}>
          <ActionsBar />
        </div>
        <CopyDialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} />
        <DeleteDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} />
        {/* <TopMenu /> */}
      </div>
    </FrdyAppReact>
  );
}
