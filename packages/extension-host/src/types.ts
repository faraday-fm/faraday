export type ExtensionHostPorts = {
  apiPort: MessagePort;
};

export type ExtensionHost = {
  initPorts(ports: ExtensionHostPorts): void;
  loadScript(script: string): Promise<void>;
};

export type ExtensionApi = {
  showMessage(message: string): void;
};
