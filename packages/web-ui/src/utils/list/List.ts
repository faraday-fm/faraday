
export interface List<T> extends Iterable<T> {
  size(): number;
  get(index: number): T | undefined;
  set(index: number, item: T): List<T>;
  append(item: T): List<T>;
  delete(index: number): List<T>;
  findIndex(predicate: (item: T) => boolean): number;
  slice(from: number, to: number): List<T>;
  map<To>(mapper: (item: T) => To): List<To>;
  reduce<To>(reducer: (agg: To, item: T) => To, init: To): To;
  sort(sorter: (a: T, b: T) => number): List<T>;
  filter(predicate: (item: T) => boolean): List<T>;
  unshift(item: T): List<T>;
  toSet(): Set<T>;
}
