import { AttribBits, type Dirent, type FileSystemProvider, FileType } from "../fs";
import { filestream } from "./filestream";
import { streamToUint8Array } from "./streamToUint8Array";

export async function readFile(fs: FileSystemProvider, path: string, options?: { signal?: AbortSignal }) {
  const stream = filestream(fs, path, options?.signal);
  return streamToUint8Array(stream);
}

export function isDir(dirent: Dirent) {
  return (dirent.attrs.type & FileType.Dir) !== 0;
}

export function chechAttribBit(dirent: Dirent, bit: AttribBits) {
  if (!dirent.attrs.attribBits) {
    return false;
  }
  let bits = dirent.attrs.attribBits;
  if (dirent.attrs.attribBitsValid) {
    bits &= dirent.attrs.attribBitsValid;
  }
  return (bits & bit) !== 0;
}

export function isHidden(dirent: Dirent) {
  return chechAttribBit(dirent, AttribBits.HIDDEN);
}
