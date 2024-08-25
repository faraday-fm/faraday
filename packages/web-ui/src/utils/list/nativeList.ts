import { List } from "./List";

export function createList<T>(e?: Iterable<T>): List<T> {
  const l = Array.isArray(e) ? e : Array.from(e ?? []);
  return {
    get: (index) => l[index],
    set: (index, item) => createList(l.toSpliced(index, 1, item)),
    append: (item) => createList([...l, item]),
    delete: (index) => createList(l.toSpliced(index, 1)),
    findIndex: (predicate) => l.findIndex(predicate),
    map: (mapper) => createList(l.map(mapper)),
    reduce: (reducer, init) => l.reduce(reducer, init),
    size: () => l.length,
    slice: (from, to) => createList(l.slice(from, to)),
    sort: (sorter) => createList(l.sort(sorter)),
    filter: (predicate) => createList(l.filter(predicate, l)),
    unshift: (item) => createList([item, ...l]),
    [Symbol.iterator]: () => l[Symbol.iterator](),
    toSet: () => new Set(l),
  };
}

export function empty<T>(): List<T> {
  return createList([]);
}
