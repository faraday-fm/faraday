import {
  type AceMask,
  type AttrFlags,
  AttribBits,
  type Attrs,
  type DirList,
  type Dirent,
  type FileHandle,
  FileSystemError,
  type FileSystemProvider,
  FileType,
  Flags,
  type RealPathControlByte,
  type RenameFlags,
  isDir,
} from "@frdy/sdk";
import { SynchronousPromise } from "synchronous-promise";

type FsEntry = Dirent & {
  content?: Uint8Array;
  children?: FsEntry[];
};

function createAttrs({ hidden }: { hidden?: boolean }): AttribBits {
  let attribBits = 0 as AttribBits;
  if (hidden != null) {
    if (hidden) {
      attribBits |= AttribBits.HIDDEN;
    } else {
      attribBits &= ~AttribBits.HIDDEN;
    }
  }
  return attribBits;
}

function realpathArray(home: string, path: string) {
  path = path.replaceAll("//", "/");
  if (path.startsWith("/")) {
    home = "/";
    path = path.substring(1);
  }
  if (path.endsWith("/")) {
    path = path.substring(0, path.length - 1);
  }
  if (home.startsWith("/")) {
    home = home.substring(1);
  }
  const pathParts = home
    .split("/")
    .concat(path.split("/"))
    .filter((p) => p);
  let i = 0;
  while (i < pathParts.length) {
    if (pathParts[i] === ".") {
      pathParts.splice(i, 1);
    } else if (pathParts[i] === "..") {
      if (i > 0) {
        i--;
        pathParts.splice(i, 2);
      } else {
        pathParts.splice(i, 1);
      }
    } else {
      i++;
    }
  }
  return pathParts;
}

function realpath(root: string, ...segments: string[]) {
  let rp = root;
  segments.forEach((s) => {
    rp = realpathArray(rp, s).join("/");
  });
  return `/${rp}`;
}

export class MemoryFsProvider implements FileSystemProvider {
  #handles = new Map<string, FsEntry>();
  #root: FsEntry = {
    attrs: { type: FileType.Dir },
    filename: "",
    path: "/",
    children: [],
  };

  #findEntry(path: string): FsEntry {
    const pathArray = realpathArray("/", path);
    let e: FsEntry | undefined = this.#root;
    for (const p of pathArray) {
      if (!e) {
        throw new FileSystemError(`File not found: ${path}`);
      }
      if (!isDir(e) || !e.children) {
        throw new FileSystemError("!!!");
      }
      e = e.children.find((c) => c.filename === p);
    }
    if (!e) {
      throw new FileSystemError(`File not found: ${path}`);
    }
    return e;
  }

  #findHandle(handle: FileHandle): FsEntry {
    const entry = this.#handles.get(handle);
    if (!entry) {
      throw new FileSystemError();
    }
    return entry;
  }

  #createHandle(entry: FsEntry): FileHandle {
    const handle = crypto.randomUUID();
    this.#handles.set(handle, entry);
    return handle;
  }

  open(filename: string, desiredAccess: AceMask, flags: Flags, attrs: Attrs): Promise<FileHandle> {
    filename = realpath("/", filename);
    const accessDisposition = flags & Flags.ACCESS_DISPOSITION;

    if (accessDisposition === Flags.OPEN_EXISTING || accessDisposition === Flags.TRUNCATE_EXISTING) {
      const entry = this.#findEntry(filename);
      if (isDir(entry)) {
        throw new FileSystemError();
      }
      if (accessDisposition === Flags.TRUNCATE_EXISTING) {
        entry.content = undefined;
      }
      return SynchronousPromise.resolve(this.#createHandle(entry));
    }

    const parts = realpathArray("/", filename);
    if (parts.length === 0) {
      throw new FileSystemError();
    }

    const containingDir = parts.slice(0, parts.length - 1).join("/") || "/";
    const dirEntry = this.#findEntry(containingDir);
    if (!isDir(dirEntry) || !dirEntry.children) {
      throw new FileSystemError();
    }
    const file = parts.at(-1)!;
    const existing = dirEntry.children.find((f) => f.filename === file);
    if (existing) {
      if (accessDisposition === Flags.CREATE_NEW) {
        throw new FileSystemError();
      }
      if (accessDisposition === Flags.CREATE_TRUNCATE) {
        existing.content = undefined;
      }
      return SynchronousPromise.resolve(this.#createHandle(existing));
    }
    const attribBits = createAttrs({ hidden: file.startsWith(".") });
    const newEntry: Dirent = {
      filename: file,
      path: filename,
      attrs: {
        ...attrs,
        type: attrs?.type ?? 0,
        attribBits,
        attribBitsValid: AttribBits.HIDDEN,
      },
    };
    dirEntry.children.push(newEntry);
    return SynchronousPromise.resolve(this.#createHandle(newEntry));
  }

  openDir(path: string): Promise<FileHandle> {
    const entry = this.#findEntry(path);
    if (!isDir(entry)) {
      throw new FileSystemError();
    }
    return SynchronousPromise.resolve(this.#createHandle(entry));
  }

  close(handle: FileHandle): Promise<void> {
    if (!this.#handles.delete(handle)) {
      throw new FileSystemError();
    }
    return SynchronousPromise.resolve();
  }

  read(handle: FileHandle, offset: number, length: number): Promise<Uint8Array> {
    const entry = this.#findHandle(handle);
    if (isDir(entry)) {
      throw new FileSystemError();
    }
    return SynchronousPromise.resolve(entry.content?.slice(offset, offset + length) ?? new Uint8Array());
  }

  readDir(handle: FileHandle): Promise<DirList> {
    const entry = this.#findHandle(handle);
    if (!isDir(entry)) {
      throw new FileSystemError();
    }
    const files: Dirent[] =
      entry.children?.map((c) => ({
        filename: c.filename,
        path: c.path,
        attrs: c.attrs,
      })) ?? [];
    if (entry !== this.#root) {
      files.unshift({
        filename: "..",
        attrs: entry.attrs,
        path: realpath(entry.path, "."),
      });
    }
    return SynchronousPromise.resolve({ files, endOfList: true });
  }

  write(handle: FileHandle, offset: number, data: Uint8Array): Promise<void> {
    const entry = this.#findHandle(handle);
    if (isDir(entry)) {
      throw new FileSystemError();
    }
    if (!entry.content) {
      entry.content = new Uint8Array(offset + data.byteLength);
      entry.content.set(data, offset);
    } else {
      if (entry.content.byteLength < offset + data.byteLength) {
        const prevContent = entry.content;
        entry.content = new Uint8Array(offset + data.byteLength);
        entry.content.set(prevContent, 0);
      }
      entry.content.set(data, offset);
    }
    entry.attrs.size = entry.content.byteLength;
    return SynchronousPromise.resolve();
  }

  async remove(filename: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async rename(oldpath: string, newpath: string, flags: RenameFlags): Promise<void> {
    throw new Error("Method not implemented.");
  }

  mkdir(path: string, attrs: Attrs): Promise<void> {
    const parts = realpathArray("/", path);
    if (parts.length === 0) {
      throw new FileSystemError();
    }
    const containingDir = parts.slice(0, parts.length - 1).join("/") || "/";
    const dirName = parts.at(-1)!;
    const dirEntry = this.#findEntry(containingDir);
    const attribBits = createAttrs({ hidden: dirName.startsWith(".") });
    (dirEntry.children ??= []).push({
      filename: dirName,
      path: realpath(dirEntry.path, dirName),
      children: [],
      attrs: {
        ...attrs,
        type: FileType.Dir,
        attribBits,
        attribBitsValid: AttribBits.HIDDEN,
      },
    });
    return SynchronousPromise.resolve();
  }

  rmdir(path: string): Promise<void> {
    const entry = this.#findEntry(path);
    return SynchronousPromise.resolve();
  }

  stat(path: string, flags: AttrFlags): Promise<Attrs> {
    throw new Error("Method not implemented.");
  }

  lstat(path: string, flags: AttrFlags): Promise<Attrs> {
    throw new Error("Method not implemented.");
  }

  fstat(handle: FileHandle, flags: AttrFlags): Promise<Attrs> {
    const entry = this.#findHandle(handle);
    return SynchronousPromise.resolve(entry.attrs);
  }

  setStat(path: string, attrs: Attrs): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setFstat(handle: FileHandle, attrs: Attrs): Promise<void> {
    const entry = this.#findHandle(handle);
    entry.attrs = attrs;
    return SynchronousPromise.resolve();
  }

  readLink(path: string): Promise<DirList> {
    throw new Error("Method not implemented.");
  }

  link(newLinkPath: string, existingPath: string, symLink: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }

  block(handle: FileHandle, offset: number, length: number, uLockMask: Flags): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unblock(handle: FileHandle, offset: number, length: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  realpath(originalPath: string, controlByte?: RealPathControlByte, composePath?: string[]): Promise<DirList> {
    const rp = realpath("/", originalPath, ...(composePath ?? []));
    return SynchronousPromise.resolve({
      files: [
        {
          filename: rp,
          path: rp,
          attrs: { type: 0 as FileType },
        },
      ],
      endOfList: true,
    });
  }

  textSeek?(fileHandle: FileHandle, lineNumber: number): Promise<void> {
    const entry = this.#findHandle(fileHandle);
    return SynchronousPromise.resolve();
  }
}
