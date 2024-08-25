import { List as IL } from "immutable";
import { List } from "./List";

export function createList<T>(e?: Iterable<T>): List<T> {
  const l = IL<T>(e);
  return {
    get: (index) => l.get(index),
    set: (index, item) => createList(l.set(index, item)),
    append: (item) => createList(l.push(item)),
    delete: (index) => createList(l.remove(index)),
    findIndex: (predicate) => l.findIndex(predicate, l),
    map: (mapper) => createList(l.map(mapper, l)),
    reduce: (reducer, init) => l.reduce(reducer, init, l),
    size: () => l.size,
    slice: (from, to) => createList(l.slice(from, to)),
    sort: (sorter) => createList(l.sort(sorter)),
    filter: (predicate) => createList(l.filter(predicate, l)),
    unshift: (i) => createList(l.unshift(i)),
    [Symbol.iterator]: () => l[Symbol.iterator](),
    toSet: () => new Set(l),
  };
}

export function empty<T>(): List<T> {
  return createList([]);
}
