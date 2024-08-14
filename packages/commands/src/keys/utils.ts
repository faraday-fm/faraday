import { alt, regexp, seq, string } from "parsimmon";

const modifier = alt(string("ctrl"), string("alt"), string("shift"), string("meta"));
const modifierPlus = seq(modifier, string("+")).map(([mod]) => mod);
const modifiers = modifierPlus.many();

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

const parser = seq(modifiers, regexp(/[A-Za-z0-9]+/)).map(([mod, key]) => ({
  mod,
  key,
}));

/**
 * Parses a key combination string into a KeyCombination object.
 *
 * @param {string} keyCombinationStr - The string representing the key combination.
 * @returns {KeyCombination} - The parsed key combination object.
 */
export function parseKeyCombination(keyCombinationStr: string): KeyCombination {
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
