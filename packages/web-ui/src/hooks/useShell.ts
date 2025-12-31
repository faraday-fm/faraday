import { useMemo } from "react";

export function useShell() {
  return useMemo(
    () => ({
      open: (url: string) => {
        window.open(url, "_blank");
      },
    }),
    []
  );
}
