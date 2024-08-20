import type { Dirent, FileSystemProvider } from "@frdy/sdk";

export type NodeLayout = RowLayout | TabLayout | TabSetLayout;

export type RowLayout = {
  type: "row";
  id: string;
  flex?: number;
  children: (TabSetLayout | RowLayout)[];
};

export type TabLayout = {
  type: "tab";
  id: string;
  flex?: number;
  name: string;
  path: string;
  component: TabComponentLayout;
};

export type TabSetLayout = {
  type: "tab-set";
  id: string;
  activeTabId?: string;
  flex?: number;
  children: TabLayout[];
};

export type TabFilesFullView = {
  type: "full";
  columnDefs: { field: string; name: string; flex?: number }[];
};

export type TabFilesCondensedView = {
  type: "condensed";
};

export type TabFilesView = TabFilesFullView | TabFilesCondensedView;

export type TabFilesLayout = {
  type: "files";
  view: TabFilesView;
};

export type TabComponentLayout = TabFilesLayout;

export interface FaradayConfig {
  isDesktop(): boolean;
}

export type TerminalSession = symbol;

export interface Terminal {
  createSession(command: string, cwd: string, onData: (data: Uint8Array) => void, initialTtySize: { rows: number; cols: number }): Promise<TerminalSession>;
  destroySession(session: TerminalSession): Promise<void>;
  setTtySize(session: TerminalSession, size: { rows: number; cols: number }): Promise<void>;
  sendData(session: TerminalSession, data: string | Uint8Array): Promise<void>;
}

export interface FaradayHost {
  config: FaradayConfig;
  rootFs: FileSystemProvider;
  terminal?: Terminal;
}

export interface FaradayProps {
  host: FaradayHost;
}
