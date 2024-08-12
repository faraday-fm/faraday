import { type Dirent, type FileSystemProvider, FileType } from "../fs";
import { filestream } from "./filestream";
import { streamToUint8Array } from "./streamToUint8Array";

export async function readFile(fs: FileSystemProvider, path: string, options?: { signal?: AbortSignal }) {
  const stream = filestream(fs, path, options?.signal);
  return streamToUint8Array(stream);
}

export function isDir(dirent: Dirent) {
  return (dirent.attrs.type & FileType.Dir) !== 0;
}
