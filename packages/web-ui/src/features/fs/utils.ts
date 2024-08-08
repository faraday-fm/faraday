import { type Dirent, FileType } from "@frdy/sdk";

export function isDir(dirent: Dirent) {
  return dirent.attrs.type === FileType.DIRECTORY;
}
