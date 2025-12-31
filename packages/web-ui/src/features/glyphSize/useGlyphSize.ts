import { useContext } from "react";
import { GlyphSizeContext } from "./GlyphSizeContext";

export function useGlyphSize() {
  return useContext(GlyphSizeContext);
}
