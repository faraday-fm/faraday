import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { FspResponse } from './types';
import { emitError, emitOkResponse } from './utils';

// Simple handle management - in a real implementation, this should be more robust
const handles = new Map<string, { type: 'file' | 'dir'; fileHandle?: fs.promises.FileHandle; path?: string; dirEntries?: string[]; dirIndex?: number }>();
let handleCounter = 0;

function generateHandle(): string {
  return `handle_${++handleCounter}`;
}

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
  // Let Node.js resolve it relative to CWD
  return filePath;
}

export async function handleOpen(
  id: number,
  filename: string,
  desiredAccess: number,
  flags: number,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedFilename = resolvePath(filename);
  console.log('[FSP Core] open:', { id, filename, resolvedFilename, desiredAccess, flags });
  
  try {
    // Convert SFTP flags to Node.js flags
    let nodeFlags = 'r';
    const accessDisposition = flags & 0x00000007;
    
    switch (accessDisposition) {
      case 0x00000000: // CREATE_NEW
        nodeFlags = 'wx';
        break;
      case 0x00000001: // CREATE_TRUNCATE
        nodeFlags = 'w';
        break;
      case 0x00000002: // OPEN_EXISTING
        nodeFlags = 'r+';
        break;
      case 0x00000003: // OPEN_OR_CREATE
        nodeFlags = 'a+';
        break;
      case 0x00000004: // TRUNCATE_EXISTING
        nodeFlags = 'r+';
        break;
    }
    
    const fileHandle = await fs.promises.open(resolvedFilename, nodeFlags);
    const handle = generateHandle();
    handles.set(handle, { type: 'file', fileHandle, path: resolvedFilename });
    
    console.log('[FSP Core] open success:', { id, handle, filename: resolvedFilename });
    emitOkResponse(sender, id, handle);
  } catch (err: any) {
    console.error('[FSP Core] open error:', { id, filename: resolvedFilename, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleOpenDir(
  id: number,
  dirPath: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedPath = resolvePath(dirPath);
  console.log('[FSP Core] openDir:', { id, path: dirPath, resolvedPath });
  
  try {
    const handle = generateHandle();
    handles.set(handle, { type: 'dir', path: resolvedPath, dirIndex: 0 });
    
    console.log('[FSP Core] openDir success:', { id, handle, path: resolvedPath });
    emitOkResponse(sender, id, handle);
  } catch (err: any) {
    console.error('[FSP Core] openDir error:', { id, path: resolvedPath, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleClose(
  id: number,
  handle: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  console.log('[FSP Core] close:', { id, handle });
  
  try {
    const handleData = handles.get(handle);
    if (!handleData) {
      throw new Error('Invalid handle');
    }
    
    if (handleData.type === 'file' && handleData.fileHandle) {
      await handleData.fileHandle.close();
    }
    
    handles.delete(handle);
    console.log('[FSP Core] close success:', { id, handle });
    emitOkResponse(sender, id, null);
  } catch (err: any) {
    console.error('[FSP Core] close error:', { id, handle, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleRead(
  id: number,
  handle: string,
  offset: number,
  length: number,
  sender: (response: FspResponse) => void
): Promise<void> {
  console.log('[FSP Core] read:', { id, handle, offset, length });
  
  try {
    const handleData = handles.get(handle);
    if (!handleData || handleData.type !== 'file' || !handleData.fileHandle) {
      throw new Error('Invalid file handle');
    }
    
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handleData.fileHandle.read(buffer, 0, length, offset);
    const data = buffer.slice(0, bytesRead).toString('base64');
    
    console.log('[FSP Core] read success:', { id, handle, bytesRead });
    emitOkResponse(sender, id, data);
  } catch (err: any) {
    console.error('[FSP Core] read error:', { id, handle, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleReadDir(
  id: number,
  handle: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  console.log('[FSP Core] readDir:', { id, handle });
  
  try {
    const handleData = handles.get(handle);
    if (!handleData || handleData.type !== 'dir' || !handleData.path) {
      throw new Error('Invalid directory handle');
    }
    
    // Read entries if not already cached
    if (!handleData.dirEntries) {
      const entries = await fs.promises.readdir(handleData.path);
      
      // Add ".." for non-root directories
      const normalizedPath = path.normalize(handleData.path);
      const parentPath = path.dirname(normalizedPath);
      const isRoot = normalizedPath === parentPath || 
                     normalizedPath === path.parse(normalizedPath).root;
      
      if (!isRoot) {
        handleData.dirEntries = ['..', ...entries];
      } else {
        handleData.dirEntries = entries;
      }
      handleData.dirIndex = 0;
    }
    
    const batchSize = 100;
    const startIndex = handleData.dirIndex || 0;
    const endIndex = Math.min(startIndex + batchSize, handleData.dirEntries.length);
    const batch = handleData.dirEntries.slice(startIndex, endIndex);
    
    const files = await Promise.all(
      batch.map(async (entry) => {
        try {
          // Handle ".." special case
          if (entry === '..') {
            const parentPath = path.dirname(handleData.path!);
            const stats = await fs.promises.stat(parentPath);
            
            return {
              filename: '..',
              path: parentPath,
              attrs: {
                type: (1 << 31), // Directory type
                size: stats.size,
                mtime: Math.floor(stats.mtimeMs),
                permissions: stats.mode & 0o777
              }
            };
          }
          
          const fullPath = path.join(handleData.path!, entry);
          const stats = await fs.promises.stat(fullPath);
          
          return {
            filename: entry,
            path: fullPath,
            attrs: {
              type: stats.isDirectory() ? (1 << 31) : 0,
              size: stats.size,
              mtime: Math.floor(stats.mtimeMs),
              permissions: stats.mode & 0o777
            }
          };
        } catch (err) {
          console.warn('[FSP Core] readDir stat error:', { entry, error: (err as Error).message });
          return {
            filename: entry,
            path: path.join(handleData.path!, entry),
            attrs: { type: 0, size: 0 }
          };
        }
      })
    );
    
    handleData.dirIndex = endIndex;
    const endOfList = endIndex >= handleData.dirEntries.length;
    
    console.log('[FSP Core] readDir success:', { id, handle, count: files.length, endOfList });
    emitOkResponse(sender, id, { files, endOfList: endOfList ? true : undefined });
  } catch (err: any) {
    console.error('[FSP Core] readDir error:', { id, handle, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleStat(
  id: number,
  filePath: string,
  flags: number,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedPath = resolvePath(filePath);
  console.log('[FSP Core] stat:', { id, path: filePath, resolvedPath, flags });
  
  try {
    const stats = await fs.promises.stat(resolvedPath);
    
    const attrs = {
      type: stats.isDirectory() ? (1 << 31) : 0,
      size: stats.size,
      mtime: Math.floor(stats.mtimeMs),
      atime: Math.floor(stats.atimeMs),
      permissions: stats.mode & 0o777
    };
    
    console.log('[FSP Core] stat success:', { id, path: resolvedPath, size: stats.size });
    emitOkResponse(sender, id, attrs);
  } catch (err: any) {
    console.error('[FSP Core] stat error:', { id, path: resolvedPath, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleLstat(
  id: number,
  filePath: string,
  flags: number,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedPath = resolvePath(filePath);
  console.log('[FSP Core] lstat:', { id, path: filePath, resolvedPath, flags });
  
  try {
    const stats = await fs.promises.lstat(resolvedPath);
    
    const attrs = {
      type: stats.isDirectory() ? (1 << 31) : stats.isSymbolicLink() ? (1 << 26) : 0,
      size: stats.size,
      mtime: Math.floor(stats.mtimeMs),
      atime: Math.floor(stats.atimeMs),
      permissions: stats.mode & 0o777
    };
    
    console.log('[FSP Core] lstat success:', { id, path: resolvedPath });
    emitOkResponse(sender, id, attrs);
  } catch (err: any) {
    console.error('[FSP Core] lstat error:', { id, path: resolvedPath, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleMkdir(
  id: number,
  dirPath: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedPath = resolvePath(dirPath);
  console.log('[FSP Core] mkdir:', { id, path: dirPath, resolvedPath });
  
  try {
    await fs.promises.mkdir(resolvedPath, { recursive: false });
    console.log('[FSP Core] mkdir success:', { id, path: resolvedPath });
    emitOkResponse(sender, id, null);
  } catch (err: any) {
    console.error('[FSP Core] mkdir error:', { id, path: resolvedPath, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleRmdir(
  id: number,
  dirPath: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedPath = resolvePath(dirPath);
  console.log('[FSP Core] rmdir:', { id, path: dirPath, resolvedPath });
  
  try {
    await fs.promises.rmdir(resolvedPath);
    console.log('[FSP Core] rmdir success:', { id, path: resolvedPath });
    emitOkResponse(sender, id, null);
  } catch (err: any) {
    console.error('[FSP Core] rmdir error:', { id, path: resolvedPath, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleRemove(
  id: number,
  filename: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedFilename = resolvePath(filename);
  console.log('[FSP Core] remove:', { id, filename, resolvedFilename });
  
  try {
    await fs.promises.unlink(resolvedFilename);
    console.log('[FSP Core] remove success:', { id, filename: resolvedFilename });
    emitOkResponse(sender, id, null);
  } catch (err: any) {
    console.error('[FSP Core] remove error:', { id, filename: resolvedFilename, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleRename(
  id: number,
  oldPath: string,
  newPath: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  const resolvedOldPath = resolvePath(oldPath);
  const resolvedNewPath = resolvePath(newPath);
  console.log('[FSP Core] rename:', { id, oldPath, resolvedOldPath, newPath, resolvedNewPath });
  
  try {
    await fs.promises.rename(resolvedOldPath, resolvedNewPath);
    console.log('[FSP Core] rename success:', { id, oldPath: resolvedOldPath, newPath: resolvedNewPath });
    emitOkResponse(sender, id, null);
  } catch (err: any) {
    console.error('[FSP Core] rename error:', { id, oldPath: resolvedOldPath, newPath: resolvedNewPath, error: err.message });
    emitError(sender, id, err.message);
  }
}

export async function handleWrite(
  id: number,
  handle: string,
  offset: number,
  data: string,
  sender: (response: FspResponse) => void
): Promise<void> {
  console.log('[FSP Core] write:', { id, handle, offset, dataLength: data.length });
  
  try {
    const handleData = handles.get(handle);
    if (!handleData || handleData.type !== 'file' || !handleData.fileHandle) {
      throw new Error('Invalid file handle');
    }
    
    const buffer = Buffer.from(data, 'base64');
    await handleData.fileHandle.write(buffer, 0, buffer.length, offset);
    
    console.log('[FSP Core] write success:', { id, handle, bytes: buffer.length });
    emitOkResponse(sender, id, null);
  } catch (err: any) {
    console.error('[FSP Core] write error:', { id, handle, error: err.message });
    emitError(sender, id, err.message);
  }
}
