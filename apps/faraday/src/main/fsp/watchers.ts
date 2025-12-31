const watchers = new Map<number, () => void>();

export function registerWatcher(id: number, unwatch: () => void): void {
  watchers.set(id, unwatch);
}

export function unwatch(id: number): boolean {
  const cancelFunc = watchers.get(id);
  if (cancelFunc) {
    watchers.delete(id);
    cancelFunc();
    return true;
  }
  return false;
}
