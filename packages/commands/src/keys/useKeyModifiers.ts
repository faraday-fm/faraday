import { useEffect, useState } from "react";

const getModifiers = (e: KeyboardEvent) => {
  return [e.ctrlKey ? "Ctrl" : "", e.altKey ? "Alt" : "", e.shiftKey ? "Shift" : "", e.metaKey ? "Meta" : ""].filter((m) => m).join("+");
};

export function useKeyModifiers() {
  const [modifiers, setModifiers] = useState("");

  useEffect(() => {
    const onKeyChange = (e: KeyboardEvent) => setModifiers(getModifiers(e));
    window.addEventListener("keydown", onKeyChange, { capture: true });
    window.addEventListener("keyup", onKeyChange, { capture: true });
    return () => {
      window.removeEventListener("keyup", onKeyChange, { capture: true });
      window.removeEventListener("keydown", onKeyChange, { capture: true });
    };
  }, []);

  return {
    modifiers,
    getModifiers,
  };
}
