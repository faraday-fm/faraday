import * as Comlink from "comlink";
import type { ExtensionApi, ExtensionHost } from "./types";

const apiPromise = Promise.withResolvers<Comlink.Remote<ExtensionApi>>();

const exposedApi: ExtensionHost = {
  initPorts({ apiPort }) {
    apiPromise.resolve(Comlink.wrap<ExtensionApi>(apiPort));
  },
  async loadScript(script) {
    const blob = new Blob([script], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    await apiPromise.promise;
    await import(url);
  },
};

Comlink.expose(exposedApi);
