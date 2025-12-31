import { atom, useAtom } from "jotai";
import { useCallback } from "react";

interface ErrorState {
  message: string;
  context?: string;
}

const errorAtom = atom<ErrorState | null>(null);

export function useError() {
  const [error, setErrorState] = useAtom(errorAtom);

  const showError = useCallback((message: string, context?: string) => {
    setErrorState({ message, context });
  }, [setErrorState]);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, [setErrorState]);

  return {
    error,
    showError,
    clearError
  };
}
