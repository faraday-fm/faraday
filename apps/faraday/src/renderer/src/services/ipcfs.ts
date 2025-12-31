import type { FileSystemProvider } from "@frdy/sdk";

const pool = new Map<number, PromiseWithResolvers<any>>();

window.api.fsp.onResponse((msg) => {
  console.info("[FSP] <<", msg);
  const { id, result, error, update, progress } = msg;
  
  if (update !== undefined) {
    console.log("[FSP] Update notification:", { id, update });
    return;
  }
  
  if (progress !== undefined) {
    console.log("[FSP] Progress notification:", { id, progress });
    return;
  }
  
  const task = pool.get(id);
  if (task) {
    pool.delete(id);
    if (error) {
      console.error("[FSP] Error:", { id, error });
      task.reject(error);
    } else {
      console.log("[FSP] Success:", { id, result: typeof result === 'object' ? { ...result } : result });
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
  console.info("[FSP] >>", { type, id: requestId, args });
  window.api.fsp.sendRequest({ id: requestId, type, args });
  return task.promise;
}

export const ipcfs: FileSystemProvider = {
  open: async (filename, desiredAccess, flags, attrs, options) => {
    console.log("[FS] open:", { filename, desiredAccess, flags });
    return invokeRequest("open", { filename, desiredAccess, flags, attrs }, options?.signal);
  },
  openDir: async (path, options) => {
    console.log("[FS] openDir:", { path });
    return invokeRequest("openDir", { path }, options?.signal);
  },
  close: async (handle, options) => {
    console.log("[FS] close:", { handle });
    return invokeRequest("close", { handle }, options?.signal);
  },
  read: async (handle, offset, length, options) => {
    console.log("[FS] read:", { handle, offset, length });
    const result: string = await invokeRequest("read", { handle, offset, length }, options?.signal);
    return Uint8Array.from(atob(result), (c) => c.charCodeAt(0));
  },
  readDir: async (handle, options) => {
    console.log("[FS] readDir:", { handle });
    const dir = await invokeRequest("readDir", { handle }, options?.signal);
    console.log("[FS] readDir result:", { handle, entries: dir?.files?.length });
    return dir;
  },
  write: async (handle, offset, data, options) => {
    console.log("[FS] write:", { handle, offset, length: data.length });
    return invokeRequest("write", { handle, offset, data }, options?.signal);
  },
  remove: async (filename, options) => {
    console.log("[FS] remove:", { filename });
    return invokeRequest("remove", { filename }, options?.signal);
  },
  rename: async (oldpath, newpath, flags, options) => {
    console.log("[FS] rename:", { oldpath, newpath, flags });
    return invokeRequest("rename", { oldpath, newpath, flags }, options?.signal);
  },
  mkdir: async (path, attrs, options) => {
    console.log("[FS] mkdir:", { path });
    return invokeRequest("mkdir", { path, attrs }, options?.signal);
  },
  rmdir: async (path, options) => {
    console.log("[FS] rmdir:", { path });
    return invokeRequest("rmdir", { path }, options?.signal);
  },
  stat: async (path, flags, options) => {
    console.log("[FS] stat:", { path, flags });
    return invokeRequest("stat", { path, flags }, options?.signal);
  },
  lstat: async (path, flags, options) => {
    console.log("[FS] lstat:", { path, flags });
    return invokeRequest("lstat", { path, flags }, options?.signal);
  },
  fstat: async (handle, flags, options) => {
    console.log("[FS] fstat:", { handle, flags });
    return invokeRequest("fstat", { handle, flags }, options?.signal);
  },
  setStat: async (path, attrs, options) => {
    console.log("[FS] setStat:", { path });
    return invokeRequest("setStat", { path, attrs }, options?.signal);
  },
  setFstat: async (handle, attrs, options) => {
    console.log("[FS] setFstat:", { handle });
    return invokeRequest("setFstat", { handle, attrs }, options?.signal);
  },
  readLink: async (path, options) => {
    console.log("[FS] readLink:", { path });
    return invokeRequest("readLink", { path }, options?.signal);
  },
  link: async (newLinkPath, existingPath, symLink, options) => {
    console.log("[FS] link:", { newLinkPath, existingPath, symLink });
    return invokeRequest("link", { newLinkPath, existingPath, symLink }, options?.signal);
  },
  block: async (handle, offset, length, uLockMask, options) => {
    console.log("[FS] block:", { handle, offset, length });
    return invokeRequest("block", { handle, offset, length, uLockMask }, options?.signal);
  },
  unblock: async (handle, offset, length, options) => {
    console.log("[FS] unblock:", { handle, offset, length });
    return invokeRequest("unblock", { handle, offset, length }, options?.signal);
  },
  realpath: async (originalPath, controlByte, composePath, options) => {
    console.log("[FS] realpath:", { originalPath, controlByte });
    return invokeRequest("realpath", { originalPath, controlByte, composePath }, options?.signal);
  },
  textSeek: async (fileHandle, lineNumber, options) => {
    console.log("[FS] textSeek:", { fileHandle, lineNumber });
    return invokeRequest("textSeek", { fileHandle, lineNumber }, options?.signal);
  },
} as FileSystemProvider as any;
