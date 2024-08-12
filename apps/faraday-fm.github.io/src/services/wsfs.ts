import type { FileSystemProvider } from "@frdy/sdk";

const ws = new WebSocket("ws://localhost:8000/ws");

await new Promise<void>((res => ws.onopen = () => res()));

const pool = new Map<number, PromiseWithResolvers<any>>();

ws.addEventListener("message", (m) => {
  const msg = JSON.parse(m.data);
  console.info("<<", msg);
  const { id, result, error } = msg;
  const task = pool.get(id);
  if (task) {
    pool.delete(id);
    if (error) {
      task.reject(error);
    } else {
      task.resolve(result);
    }
  }
});

let requestIdCounter = 1;

function invokeRequest(type: string, args: any, signal?: AbortSignal) {
  const requestId = requestIdCounter;
  if (signal?.aborted) {
    throw new Error("aborted");
  }
  signal?.addEventListener("abort", () => {
    pool.delete(requestId);
    task.reject("aborted");
  });
  requestIdCounter++;
  const task = Promise.withResolvers<any>();
  pool.set(requestId, task);
  console.info(">>", { type, requestId, ...args });
  ws.send(JSON.stringify({ type, requestId, ...args }));
  return task.promise;
}

export const wsfs: FileSystemProvider = {
  open: (filename, desiredAccess, flags, attrs, options) => invokeRequest("open", { filename, desiredAccess, flags, attrs }, options?.signal),
  openDir: (path, options) => invokeRequest("openDir", { path }, options?.signal),
  close: (handle, options) => invokeRequest("close", { handle }, options?.signal),
  read: async (handle, offset, length, options) => {
    const result: string = await invokeRequest("read", { handle, offset, length }, options?.signal);
    return Uint8Array.from(atob(result), (c) => c.charCodeAt(0));
  },
  readDir: async (handle, options) => {
    const dir = await invokeRequest("readDir", { handle }, options?.signal);
    return dir;
  },
  write: (handle, offset, data, options) => invokeRequest("write", { handle, offset, data }, options?.signal),
  remove: (filename, options) => invokeRequest("remove", { filename }, options?.signal),
  rename: (oldpath, newpath, flags, options) => invokeRequest("rename", { oldpath, newpath, flags }, options?.signal),
  mkdir: (path, attrs, options) => invokeRequest("mkdir", { path, attrs }, options?.signal),
  rmdir: (path, options) => invokeRequest("rmdir", { path }, options?.signal),
  stat: (path, flags, options) => invokeRequest("stat", { path, flags }, options?.signal),
  lstat: (path, flags, options) => invokeRequest("lstat", { path, flags }, options?.signal),
  fstat: (handle, flags, options) => invokeRequest("fstat", { handle, flags }, options?.signal),
  setStat: (path, attrs, options) => invokeRequest("setStat", { path, attrs }, options?.signal),
  setFstat: (handle, attrs, options) => invokeRequest("setFstat", { handle, attrs }, options?.signal),
  readLink: (path, options) => invokeRequest("readLink", { path }, options?.signal),
  link: (newLinkPath, existingPath, symLink, options) => invokeRequest("link", { newLinkPath, existingPath, symLink }, options?.signal),
  block: (handle, offset, length, uLockMask, options) => invokeRequest("block", { handle, offset, length, uLockMask }, options?.signal),
  unblock: (handle, offset, length, options) => invokeRequest("unblock", { handle, offset, length }, options?.signal),
  realpath: (originalPath, controlByte, composePath, options) => invokeRequest("realpath", { originalPath, controlByte, composePath }, options?.signal),
  textSeek: (fileHandle, lineNumber, options) => invokeRequest("textSeek", { fileHandle, lineNumber }, options?.signal),
} as FileSystemProvider as any;
