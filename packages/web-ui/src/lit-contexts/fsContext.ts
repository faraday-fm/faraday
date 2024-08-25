import type { FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { Signal } from "@preact/signals-core";

export const fsContext = createContext<FileSystemProvider | undefined>(Symbol("fs"));
