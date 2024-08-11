import { useCallback, useEffect, useMemo, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const matchMedia = useMemo(() => (typeof window === "object" ? window.matchMedia(query) : undefined), [query]);
  const [matches, setMatches] = useState(matchMedia?.matches ?? false);

  const handleChange = useCallback(() => {
    setMatches(matchMedia?.matches ?? false);
  }, [matchMedia]);

  useEffect(() => {
    if (!matchMedia) {
      return;
    }
    matchMedia.addEventListener("change", handleChange);
    return () => {
      matchMedia.removeEventListener("change", handleChange);
    };
  }, [handleChange, matchMedia]);

  return matches;
}
