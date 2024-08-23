import { createList } from "./nativeList";
import { List } from "./List";

export { createList } from "./nativeList";
export type { List } from "./List";

export function empty<T>(): List<T> {
  return createList();
}
