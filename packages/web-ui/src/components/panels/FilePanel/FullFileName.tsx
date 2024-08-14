import { css } from "@css";
import { AttribBits, type Dirent, isDir } from "@frdy/sdk";
import isPromise from "is-promise";
import { memo, useEffect, useMemo, useState } from "react";
import { useFileIconResolver } from "../../../contexts/fileIconsContext";
import { useGlyphSize } from "../../../contexts/glyphSizeContext";
import { CellText } from "./CellText";
import type { CursorStyle } from "./types";

const lineItem = css`overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 calc(0.25rem - 1px);
    flex-grow: 1;
    display: flex;`;
const fileName = css`flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;`;

interface FullFileNameProps {
  cursorStyle: CursorStyle;
  dirent?: Dirent;
}

function getColor(name: string, dir: boolean | undefined, selected: boolean) {
  if (dir) return selected ? "var(--files-directory-foreground-focus)" : "var(--files-directory-foreground";
  // if (name.startsWith(".")) return selected ? "var(--color-01)" : "var(--color-02)";
  // if (name.endsWith(".toml") || name.endsWith(".json")) return selected ? "var(--color-01)" : "var(--color-10)";
  return selected ? "var(--files-file-foreground-focus)" : "var(--files-file-foreground)";
}

export const FullFileName = memo(function FullFileName({ cursorStyle, dirent }: FullFileNameProps) {
  const iconResolver = useFileIconResolver();
  const { height } = useGlyphSize();

  const resolvedIcon = useMemo(
    () => iconResolver(dirent?.path ?? "", (dirent && isDir(dirent)) ?? false, dirent?.filename === "..") ?? null,
    [dirent, iconResolver],
  );

  const emptyIcon = <div style={{ width: 17 }} />;
  const [icon, setIcon] = useState(!isPromise(resolvedIcon) ? resolvedIcon ?? emptyIcon : emptyIcon);

  useEffect(() => {
    void (async () => {
      const iconElement = isPromise(resolvedIcon) ? <>{await resolvedIcon}</> : resolvedIcon;
      if (iconElement) {
        setIcon(iconElement);
      }
    })();
  }, [resolvedIcon]);

  const name: string = dirent?.filename ?? "";

  if (!dirent) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        opacity: (dirent.attrs.attribBits ?? 0 & AttribBits.HIDDEN) !== 0 ? 0.5 : 1,
      }}
    >
      <div>{icon}</div>
      <span
        className={lineItem}
        style={{
          lineHeight: `${height}px`,
          color: getColor(dirent.filename, dirent && isDir(dirent), cursorStyle === "firm"),
        }}
      >
        <span className={fileName}>
          <CellText cursorStyle={cursorStyle} text={name} />
        </span>
      </span>
    </div>
  );
});
