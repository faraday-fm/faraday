export interface Dirent {
  name: string;
  mode: string;
  size: number;
  mtime: number;
}

export interface WatchDirSnapshot {
  snapshot: Dirent[];
}

export interface WatchDirUpdate {
  added: Dirent[];
  updated: Dirent[];
  deleted: string[];
}

export interface ProgressUpdate {
  size?: number;
  path?: string;
}

export interface FspRequest {
  id: number;
  type: string;
  args: Record<string, any>;
}

export interface FspResponse {
  id: number;
  result?: any;
  error?: string;
  update?: any;
  progress?: any;
}
