import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as chokidar from 'chokidar';
import type { Dirent, FspResponse, WatchDirUpdate } from './types';
import { emitOkResponse, emitError, emitResponse } from './utils';
import { registerWatcher, unwatch } from './watchers';
import { setProgress, clearProgress, getProgress } from './progress';

function resolvePath(filePath: string): string {
  // If path starts with ~/, replace with home directory
  if (filePath.startsWith('~/')) {
    const homeDir = os.homedir();
    return path.join(homeDir, filePath.slice(2));
  }
  
  // If path is absolute, return as-is
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  
  // Otherwise, it's a relative path - don't modify it
  return filePath;
}

function statToDirent(name: string, stats: fs.Stats): Dirent {
  return {
    name,
    mode: stats.mode.toString(8),
    size: stats.size,
    mtime: stats.mtimeMs
  };
}

async function readDir(dir: string): Promise<Dirent[]> {
  console.log('[FSP Handler] readDir:', dir);
  const entries = await fs.promises.readdir(dir);
  const result: Dirent[] = [];
  
  for (const entry of entries) {
    try {
      const stats = await fs.promises.stat(path.join(dir, entry));
      result.push(statToDirent(entry, stats));
    } catch (err) {
      console.warn('[FSP Handler] readDir - failed to stat entry:', entry, err);
      result.push({
        name: entry,
        mode: '0',
        size: 0,
        mtime: 0
      });
    }
  }
  
  console.log('[FSP Handler] readDir result:', { dir, count: result.length });
  return result;
}

export function watchDir(
  id: number,
  dir: string,
  sender: (response: FspResponse) => void
): void {
  const resolvedDir = resolvePath(dir);
  console.log('[FSP Handler] watchDir start:', { id, dir, resolvedDir });
  let timer: NodeJS.Timeout | null = null;
  const direntMap = new Map<string, Dirent>();
  
  readDir(resolvedDir)
    .then(snapshot => {
      console.log('[FSP Handler] watchDir initial snapshot:', { id, dir: resolvedDir, count: snapshot.length });
      emitOkResponse(sender, id, { snapshot });
      
      for (const dirent of snapshot) {
        direntMap.set(dirent.name, dirent);
      }
      
      const watcher = chokidar.watch(resolvedDir, {
        depth: 0,
        ignoreInitial: true,
        persistent: true
      });
      
      const handleChange = () => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          timer = null;
          console.log('[FSP Handler] watchDir change detected, re-reading:', { id, dir: resolvedDir });
          readDir(resolvedDir)
            .then(newSnapshot => {
              const added: Dirent[] = [];
              const updated: Dirent[] = [];
              const deleted: string[] = [];
              const newDirentMap = new Map<string, Dirent>();
              
              for (const dirent of newSnapshot) {
                const existing = direntMap.get(dirent.name);
                if (!existing) {
                  added.push(dirent);
                } else if (
                  dirent.size !== existing.size ||
                  dirent.mtime !== existing.mtime ||
                  dirent.mode !== existing.mode
                ) {
                  updated.push(dirent);
                }
                newDirentMap.set(dirent.name, dirent);
              }
              
              for (const [name, dirent] of direntMap) {
                if (!newDirentMap.has(name)) {
                  deleted.push(dirent.name);
                }
              }
              
              direntMap.clear();
              for (const [name, dirent] of newDirentMap) {
                direntMap.set(name, dirent);
              }
              
              if (added.length > 0 || updated.length > 0 || deleted.length > 0) {
                console.log('[FSP Handler] watchDir update:', { 
                  id, 
                  dir: resolvedDir, 
                  added: added.length, 
                  updated: updated.length, 
                  deleted: deleted.length 
                });
                const update: WatchDirUpdate = { added, updated, deleted };
                emitResponse(sender, id, 'update', update);
              }
            })
            .catch(err => {
              console.error('[FSP Handler] watchDir change error:', { id, dir: resolvedDir, error: err.message });
              emitError(sender, id, err.message);
            });
        }, 100);
      };
      
      watcher.on('all', handleChange);
      
      registerWatcher(id, () => {
        console.log('[FSP Handler] watchDir unwatch:', { id, dir: resolvedDir });
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        watcher.close();
      });
    })
    .catch(err => {
      console.error('[FSP Handler] watchDir error:', { id, dir: resolvedDir, error: err.message });
      emitError(sender, id, err.message);
    });
}

export function watchFile(
  id: number,
  filePath: string,
  sender: (response: FspResponse) => void
): void {
  const resolvedPath = resolvePath(filePath);
  console.log('[FSP Handler] watchFile start:', { id, filePath, resolvedPath });
  let timer: NodeJS.Timeout | null = null;
  
  emitOkResponse(sender, id, null);
  
  const watcher = chokidar.watch(resolvedPath, {
    ignoreInitial: true,
    persistent: true
  });
  
  const handleChange = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      console.log('[FSP Handler] watchFile change detected:', { id, filePath: resolvedPath });
      fs.promises.stat(resolvedPath)
        .then(stats => {
          const dirent = statToDirent(path.basename(resolvedPath), stats);
          console.log('[FSP Handler] watchFile update:', { id, filePath: resolvedPath, size: stats.size });
          emitResponse(sender, id, 'update', dirent);
        })
        .catch((err) => {
          console.warn('[FSP Handler] watchFile stat error (file may be deleted):', { id, filePath: resolvedPath, error: err.message });
        });
    }, 100);
  };
  
  watcher.on('all', handleChange);
  
  registerWatcher(id, () => {
    console.log('[FSP Handler] watchFile unwatch:', { id, filePath: resolvedPath });
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    watcher.close();
  });
}

export function handleUnwatch(
  id: number,
  requestId: number,
  sender: (response: FspResponse) => void
): void {
  console.log('[FSP Handler] unwatch:', { id, requestId });
  const success = unwatch(requestId);
  if (success) {
    console.log('[FSP Handler] unwatch success:', { id, requestId });
    emitOkResponse(sender, id, null);
  } else {
    console.error('[FSP Handler] unwatch failed - unknown requestId:', { id, requestId });
    emitError(sender, id, `Unknown requestId: ${requestId}`);
  }
}

export async function dirSize(
  id: number,
  dir: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedDir = resolvePath(dir);
  console.log('[FSP Handler] dirSize start:', { id, dir, resolvedDir });
  let totalSize = 0;
  let fileCount = 0;
  
  async function walk(currentPath: string): Promise<void> {
    try {
      const stats = await fs.promises.stat(currentPath);
      
      if (stats.isDirectory()) {
        const entries = await fs.promises.readdir(currentPath);
        for (const entry of entries) {
          await walk(path.join(currentPath, entry));
        }
      } else {
        totalSize += stats.size;
        fileCount++;
        setProgress(id, {
          size: totalSize,
          path: currentPath
        });
      }
    } catch (err: any) {
      console.warn('[FSP Handler] dirSize walk error:', { path: currentPath, error: err.message });
    }
  }
  
  try {
    await walk(resolvedDir);
    clearProgress(id);
    console.log('[FSP Handler] dirSize complete:', { id, dir: resolvedDir, totalSize, fileCount });
    emitOkResponse(sender, id, totalSize);
  } catch (err: any) {
    clearProgress(id);
    console.error('[FSP Handler] dirSize error:', { id, dir: resolvedDir, error: err.message });
    emitError(sender, id, err.message);
  }
}

export function publishProgress(
  id: number,
  requestId: number,
  sender: (response: FspResponse) => void
): void {
  const progress = getProgress(requestId);
  console.log('[FSP Handler] publishProgress:', { id, requestId, progress });
  emitResponse(sender, id, 'progress', progress);
}

export async function fullContent(
  id: number,
  filePath: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedPath = resolvePath(filePath);
  console.log('[FSP Handler] fullContent start:', { id, filePath, resolvedPath });
  try {
    const data = await fs.promises.readFile(resolvedPath);
    console.log('[FSP Handler] fullContent success:', { id, filePath: resolvedPath, size: data.length });
    emitOkResponse(sender, id, data);
  } catch (err: any) {
    console.error('[FSP Handler] fullContent error:', { id, filePath: resolvedPath, error: err.message });
    emitError(sender, id, err.message);
  }
}
