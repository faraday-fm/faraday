import * as L from "list";
import { List } from "./List";

function fixOrderingResult<T>(s: (a: T, b: T) => number): (a: T, b: T) => L.Ordering {
  return (x, y) => {
    const r = s(x, y);
    if (r < 0) return -1;
    if (r > 0) return 1;
    return 0;
  };
}

export function createList<T>(e?: Iterable<T>): List<T> {
  const l = e ? L.from<T>(e) : L.empty<T>();
  return {
    get: (index) => L.nth(index, l),
    set: (index, item) => createList(L.update(index, item, l)),
    append: (item) => createList(L.append(item, l)),
    delete: (index) => createList(L.remove(index, 1, l)),
    findIndex: (predicate) => L.findIndex(predicate, l),
    map: (mapper) => createList(L.map(mapper, l)),
    reduce: (reducer, init) => L.reduce(reducer, init, l),
    size: () => L.length(l),
    slice: (from, to) => createList(L.slice(from, to, l)),
    sort: (sorter) => createList(L.sortWith(fixOrderingResult(sorter), l)),
    filter: (predicate) => createList(L.filter(predicate, l)),
    unshift: (i) => createList(L.prepend(i, l)),
    [Symbol.iterator]: () => l[Symbol.iterator](),
    toSet: () => new Set(l),
  };
}

export function empty<T>(): List<T> {
  return createList([]);
}
