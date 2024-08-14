import { useContext, useEffect, useState } from "react";
import { useKeyModifiers } from "./useKeyModifiers";
import { KeyBindingContext } from "./keyBindingContext";
import { useIsInContext } from "../commands";

export function useKeyCommand(key: string) {
  const [match, setMatch] = useState("");
  const isInContext = useIsInContext();
  const { modifiers } = useKeyModifiers();
  const keyCombination = modifiers ? `${modifiers}+${key}` : key;
  const bindings = useContext(KeyBindingContext);

  useEffect(() => {
    let foundMatch = "";
    for (let i = bindings.length - 1; i >= 0; i -= 1) {
      const binding = bindings[i]!;
      if (binding.key === keyCombination && (!binding.when || isInContext(binding.when))) {
        foundMatch = binding.command;
        break;
      }
    }
    setMatch(foundMatch);
  },[bindings, keyCombination, isInContext]);
  
  return match;
}
