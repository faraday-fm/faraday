import { createContext } from "react";
import { IconResolver } from "./types";

export const FileIconsContext = createContext<IconResolver>(() => undefined);
