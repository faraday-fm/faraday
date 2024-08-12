import { type Dirent, FileType } from "@frdy/sdk";
import { isDir } from "@frdy/sdk";
import { memo } from "react";
import { useGlyphSize } from "../../../contexts/glyphSizeContext";
import { css } from "../../../features/styles";
import { formatDateTime } from "../../../utils/date";
import { bytesToSize } from "../../../utils/number";

interface FileInfoFooterProps {
  file?: Dirent;
}

function formatFileSize(e?: Dirent) {
  if (!e) {
    return "";
  }
  if (isDir(e)) {
    if (e.attrs.type & FileType.Symlink) return "symlink";
    return e.filename === ".." ? "up" : "dir";
  }
  switch (true) {
    case (e.attrs.type & FileType.Symlink) !== 0:
      return "symlink";
    case (e.attrs.type & FileType.Device) !== 0:
      return "block dev";
    case (e.attrs.type & FileType.CharDevice) !== 0:
      return "char dev";
    case (e.attrs.type & FileType.NamedPipe) !== 0:
      return "fifo";
    case (e.attrs.type & FileType.Socket) !== 0:
      return "socket";
    default:
      return bytesToSize(e.attrs.size ?? 0, 999999);
  }
}

export const FileInfoFooter = memo(({ file }: FileInfoFooterProps) => {
  const { height } = useGlyphSize();
  return (
    <div className={css("file-info-root")} style={{ height }}>
      <div className={css("file-info-name")}>{file?.filename}</div>
      <div className={css("file-info-size")}>{formatFileSize(file)}</div>
      <div className={css("file-info-time")}>{file?.attrs.mtime ? formatDateTime(new Date(file.attrs.mtime * 1000)) : undefined}</div>
    </div>
  );
});
