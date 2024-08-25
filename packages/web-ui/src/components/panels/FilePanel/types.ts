import type { Dirent } from "@frdy/sdk";

export interface ColumnDef {
  name: string;
  field: keyof Dirent;
  width?: string;
  valueFormatter?: (data: unknown, value: unknown) => string;
}

export type CursorStyle = "firm" | "inactive" | "hidden";
