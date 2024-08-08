import type { FileSystemProvider } from "@frdy/sdk";
import * as Comlink from "comlink";
import { getNamedPort } from "./getNamedPort";
import type { WebViewFs } from "./types";

export const fs = Comlink.wrap<WebViewFs>(await getNamedPort("fs")) as FileSystemProvider;
