import { AttribBits, type Dirent, type FileSystemProvider, FileType } from "../fs";
import { filestream } from "./filestream";
import { streamToUint8Array } from "./streamToUint8Array";

export async function readFile(fs: FileSystemProvider, path: string, options?: { signal?: AbortSignal }) {
  const stream = filestream(fs, path, options?.signal);
  return streamToUint8Array(stream);
}

export async function readDir(fs: FileSystemProvider, path: string, options?: { signal?: AbortSignal }) {
  const files: Dirent[] = [];
  const dir = await fs.openDir(path, options);
  try {
    const dirents = await fs.readDir(dir, options);
    while (true)
      if (dirents.files.length > 0) {
        dirents.files.forEach((f) => files.push(f));
        if (dirents.endOfList) {
          break;
        }
      }
  } catch {
    await fs.close(dir);
  }
  return files;
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
