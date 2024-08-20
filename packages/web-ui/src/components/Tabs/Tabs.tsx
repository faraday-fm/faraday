import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useFocused } from "../../hooks/useFocused";
import type { TabSetLayout } from "../../types";
import { Tab } from "./Tab";

const tabName = "tabName";
// css`cursor: pointer;
//     padding-left: 1ch;
//     &:hover {
//       color: var(--panel-header-foreground-focus);
//       background-color: var(--panel-header-background-focus);
//     }
//     &.-active {
//       color: var(--panel-header-foreground-focus);
//       background-color: var(--panel-header-background-focus);
//     }`;
const tabs = "tabs";
// css`box-sizing: border-box;
//     overflow: hidden;
//     width: 100%;
//     height: 100%;
//     border: 1px solid var(--panel-border);
//     display: grid;
//     grid-template-rows: auto 1fr;`;
const tabsHeader = "tabsHeader";
// css`display: flex;
//     color: var(--panel-header-foreground);
//     background-color: var(--panel-header-background);
//     overflow: hidden;`;

export type TabsProps = {
  layout: TabSetLayout;
  setLayout: (newLayout: TabSetLayout) => void;
};

function TabName({ name, isActive }: { name: string; isActive: boolean }) {
  return <div className={clsx(tabName, isActive && "-active")}>{name}</div>;
}

export function Tabs({ layout, setLayout }: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const focused = useFocused(tabsRef);
  const setTab = (idx: number, relative = false) => {
    if (relative) {
      const tabIdx = layout.children.findIndex((t) => t.id === layout.activeTabId);
      if (tabIdx >= 0) {
        setLayout({ ...layout, activeTabId: layout.children[(tabIdx + layout.children.length + idx) % layout.children.length]?.id });
      }
    } else {
      if (idx <= layout.children.length) {
        setLayout({ ...layout, activeTabId: layout.children[idx - 1]!.id });
      }
    }
  };
  // useCommandBinding("nextTab", () => setTab(1, true), focused);
  // useCommandBinding("prevTab", () => setTab(-1, true), focused);
  // useCommandBinding("setTab", (args) => setTab(args?.index ?? 1), focused);

  useEffect(() => {
    if (!layout.activeTabId && layout.children?.length > 0) {
      setLayout({ ...layout, activeTabId: layout.children[0]?.id });
    }
  }, [layout, setLayout]);

  const activeTabLayout = layout.activeTabId != null ? layout.children?.find((c) => c.id === layout.activeTabId) : undefined;

  return (
    <div ref={tabsRef} className={tabs} tabIndex={0}>
      <div className={tabsHeader}>
        {layout.children.map((tab) => (
          <TabName key={tab.id} name={tab.name} isActive={layout.activeTabId === tab.id} />
        ))}
      </div>
      <div>{activeTabLayout && <Tab layout={activeTabLayout} />}</div>
    </div>
  );
}
