import * as Comlink from "comlink";
import type { WebView, WebViewFs, WebViewHost } from "./types";

const actionsChannel = new MessageChannel();
const hostPromise = Promise.withResolvers<Comlink.Remote<WebViewHost>>();
const fsPromise = Promise.withResolvers<Comlink.Remote<WebViewFs>>();

const comlinkEndpoint = Comlink.windowEndpoint(window.parent);
Comlink.expose(
  {
    getPorts: () => Comlink.transfer({ actions: actionsChannel.port2 }, [actionsChannel.port2]),
    setPorts({ host, fs }) {
      hostPromise.resolve(Comlink.wrap<WebViewHost>(host));
      fsPromise.resolve(Comlink.wrap<WebViewFs>(fs));
    },
  } satisfies WebView,
  comlinkEndpoint,
);

export const actionsPort = actionsChannel.port1;
export const fs = await fsPromise.promise;
export const host = await hostPromise.promise;