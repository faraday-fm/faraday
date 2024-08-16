import type { FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";

export const fsContext = createContext<FileSystemProvider>(Symbol("fs"));
