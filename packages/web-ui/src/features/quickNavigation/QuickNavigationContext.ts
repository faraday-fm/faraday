import { type RefObject, createContext } from "react";

export const QuickNavigationContext = createContext(new Map<string, RefObject<HTMLElement>>());
