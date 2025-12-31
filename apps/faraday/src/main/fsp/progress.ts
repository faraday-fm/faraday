const itemProgress = new Map<number, any>();

export function setProgress(id: number, progress: any): void {
  itemProgress.set(id, progress);
}

export function clearProgress(id: number): void {
  itemProgress.delete(id);
}

export function getProgress(requestId: number): any {
  return itemProgress.get(requestId);
}
