import { type ReactNode } from "react";

export type IconResolver = (path: string, isDir: boolean, isOpen: boolean) => ReactNode | PromiseLike<ReactNode>;

