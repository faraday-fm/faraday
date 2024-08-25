import { type FileSystemProvider, readFile } from "@frdy/sdk";
import * as Comlink from "comlink";
import worker from "../dist/extension-host.js.txt";
import type { ExtensionHost } from "./types";

export async function init(fs: FileSystemProvider, root: string) {
  const host = Comlink.wrap<ExtensionHost>(null as any);

  console.error(`data:text/javascript;charset=UTF-8,${encodeURIComponent(worker)}`);
  const apiChannel = new MessageChannel();
  Comlink.expose({}, apiChannel.port1);
  await host.initPorts(Comlink.transfer({ apiPort: apiChannel.port2 }, [apiChannel.port2]));

  // readFile
  await host.loadScript(root);
}
