import { css } from "@css";
import { type Dirent, FileType, isDir } from "@frdy/sdk";
import { memo } from "react";
import { useGlyphSize } from "../../../contexts/glyphSizeContext";
import { formatDateTime } from "../../../utils/date";
import { bytesToSize } from "../../../utils/number";

const fileInfoRoot = css`display: flex;
    overflow: hidden;
    padding: 0.5rem 0;`;
const fileInfoName = css`text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    flex: 1;`;
const fileInfoSize = css`white-space: nowrap;
    justify-self: flex-end;
    margin: 0 0.75rem;`;
const fileInfoTime = `white-space: nowrap;
    justify-self: flex-end;`;

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
    <div className={fileInfoRoot} style={{ height }}>
      <div className={fileInfoName}>{file?.filename}</div>
      <div className={fileInfoSize}>{formatFileSize(file)}</div>
      <div className={fileInfoTime}>{file?.attrs.mtime ? formatDateTime(new Date(file.attrs.mtime * 1000)) : undefined}</div>
    </div>
  );
});
