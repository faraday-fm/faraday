import { useContext } from "react";
import { FileIconsContext } from "./FileIconsContext";

export function useFileIconResolver() {
  return useContext(FileIconsContext);
}
