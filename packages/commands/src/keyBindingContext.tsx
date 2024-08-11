import JSON5 from "json5";
import { alt, regexp, seq, string } from "parsimmon";
import { type PropsWithChildren, createContext, useEffect } from "react";
import { parse } from "valibot";
import keyBindingsContent from "./assets/keybindings.json5";
import { KeyBindingsSchema } from "./schema";
import { useExecuteCommand, useIsInContext } from "./commands";

/**
 * Parsed key bindings from the provided JSON5 file.
 */
const keyBindings = parse(KeyBindingsSchema, JSON5.parse(keyBindingsContent));

/**
 * Represents the result of parsing a key combination string.
 * - If `error` is true, parsing failed.
 * - If `error` is false, the key combination is represented by the following properties:
 *   - `ctrl`: Indicates if the "Ctrl" key is part of the combination.
 *   - `alt`: Indicates if the "Alt" key is part of the combination.
 *   - `shift`: Indicates if the "Shift" key is part of the combination.
 *   - `meta`: Indicates if the "Meta" key (e.g., Command key on Mac) is part of the combination.
 *   - `code`: The specific key code that is pressed.
 */
export type KeyCombination =
  | { error: true }
  | {
      error: false;
      ctrl: boolean;
      alt: boolean;
      shift: boolean;
      meta: boolean;
      code: string;
    };

const modifier = alt(string("ctrl"), string("alt"), string("shift"), string("meta"));
const modifierPlus = seq(modifier, string("+")).map(([mod]) => mod);
const modifiers = modifierPlus.many();
const parser = seq(modifiers, regexp(/[A-Za-z0-9]+/)).map(([mod, key]) => ({
  mod,
  key,
}));

/**
 * Normalizes a key combination string by removing all whitespace and converting it to lowercase.
 *
 * @param {string} keyStr - The key combination string to normalize.
 * @returns {string} - The normalized key combination string.
 */
function normalizeKeyCombinationStr(keyStr: string): string {
  return keyStr.replaceAll(/\s+/gi, "").toLowerCase();
}

/**
 * Parses a key combination string into a KeyCombination object.
 *
 * @param {string} keyCombinationStr - The string representing the key combination.
 * @returns {KeyCombination} - The parsed key combination object.
 */
function parseKeyCombination(keyCombinationStr: string): KeyCombination {
  keyCombinationStr = normalizeKeyCombinationStr(keyCombinationStr);
  const res = parser.parse(keyCombinationStr);
  if (res.status) {
    return {
      error: false,
      alt: res.value.mod.includes("alt"),
      ctrl: res.value.mod.includes("ctrl"),
      meta: res.value.mod.includes("meta"),
      shift: res.value.mod.includes("shift"),
      code: res.value.key,
    };
  }
  return { error: true };
}

/**
 * Represents a single key binding.
 *
 * @property {string} key - The key combination as a string (e.g., "Ctrl+S").
 * @property {string} command - The command to execute when the key combination is triggered.
 * @property {string} [when] - Optional condition to determine the context in which the key binding is active.
 * @property {unknown} [args] - Optional arguments to pass to the command when executed.
 */
export interface KeyBinding {
  key: string;
  command: string;
  when?: string;
  args?: unknown;
}

/**
 * Context to provide key bindings to the component tree.
 */
const KeyBindingContext = createContext<KeyBinding[]>([]);

/**
 * Cache for parsed key combinations to avoid reparsing frequently used combinations.
 */
const parsedKeyCombinationsCache = new Map<string, KeyCombination>();

/**
 * Retrieves a KeyCombination object for a given key combination string, using a cache
 * to avoid redundant parsing.
 *
 * @param {string} keyStr - The key combination string.
 * @returns {KeyCombination} - The parsed key combination.
 */
const getKeyCombination = (keyStr: string): KeyCombination => {
  let key = parsedKeyCombinationsCache.get(keyStr);
  if (key) {
    return key;
  }
  key = parseKeyCombination(keyStr);
  parsedKeyCombinationsCache.set(keyStr, key);
  return key;
};

/**
 * Matches a key combination string against a KeyboardEvent to check if the event matches
 * the expected key combination.
 *
 * @param {string} key - The key combination string to match.
 * @param {KeyboardEvent} event - The keyboard event to check.
 * @returns {boolean} - True if the event matches the key combination, otherwise false.
 */
const matchKey = (key: string, event: KeyboardEvent): boolean => {
  const combination = getKeyCombination(key);
  if (combination.error) return false;
  return (
    event.code.toLowerCase() === combination.code &&
    event.altKey === combination.alt &&
    event.ctrlKey === combination.ctrl &&
    event.metaKey === combination.meta &&
    event.shiftKey === combination.shift
  );
};

/**
 * Provides key bindings to child components and handles keydown events to execute commands
 * when matching key combinations are detected.
 *
 * @param {PropsWithChildren} props - The properties object with children components.
 * @returns {JSX.Element} - The KeyBindingContext.Provider with the provided key bindings.
 */
export function KeyBindingProvider({ children }: PropsWithChildren): JSX.Element {
  const isInContext = useIsInContext();
  const executeCommand = useExecuteCommand();

  const bindings = keyBindings;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const keyCodeStr = [
        e.ctrlKey ? "Ctrl" : "",
        e.altKey ? "Alt" : "",
        e.shiftKey ? "Shift" : "",
        e.metaKey ? "Meta" : "",
        e.code,
      ]
        .filter((m) => m)
        .join("+");
      console.debug("Key pressed:", e.key, "(", keyCodeStr, ")");
      for (let i = bindings.length - 1; i >= 0; i -= 1) {
        const binding = bindings[i]!;
        if (matchKey(binding.key, e) && (!binding.when || isInContext(binding.when))) {
          if (binding.args != null) {
            console.debug(binding.command, "(", JSON.stringify(binding.args), ")");
          } else {
            console.debug(binding.command, "()");
          }
          void executeCommand(binding.command, binding.args);
          e.stopPropagation();
          e.preventDefault();
          break;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [bindings, executeCommand, isInContext]);

  return <KeyBindingContext.Provider value={bindings}>{children}</KeyBindingContext.Provider>;
}
