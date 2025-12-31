import { ipcMain, type IpcMainEvent } from 'electron';
import type { FspRequest, FspResponse } from './types';
import { emitError } from './utils';
import {
  watchDir,
  watchFile,
  handleUnwatch,
  dirSize,
  publishProgress,
  fullContent
} from './handlers';
import {
  handleOpen,
  handleOpenDir,
  handleClose,
  handleRead,
  handleReadDir,
  handleStat,
  handleLstat,
  handleMkdir,
  handleRmdir,
  handleRemove,
  handleRename,
  handleWrite
} from './core-handlers';

export function setupFspHandlers(): void {
  ipcMain.on('fsp-request', (event: IpcMainEvent, request: FspRequest) => {
    const sender = (response: FspResponse) => {
      event.sender.send('fsp-response', response);
    };

    const { id, type, args } = request;

    console.log('[FSP IPC] Request received:', { id, type, args });

    if (!id || id === 0) {
      console.error('[FSP IPC] Error: id field is required');
      return;
    }

    if (!type || type === '') {
      console.error('[FSP IPC] Error: type field is required');
      emitError(sender, id, "'type' field is required");
      return;
    }

    switch (type) {
      // Core FileSystemProvider methods
      case 'open':
        handleOpen(id, args.filename, args.desiredAccess, args.flags, sender);
        break;

      case 'openDir':
        handleOpenDir(id, args.path, sender);
        break;

      case 'close':
        handleClose(id, args.handle, sender);
        break;

      case 'read':
        handleRead(id, args.handle, args.offset, args.length, sender);
        break;

      case 'readDir':
        handleReadDir(id, args.handle, sender);
        break;

      case 'write':
        handleWrite(id, args.handle, args.offset, args.data, sender);
        break;

      case 'remove':
        handleRemove(id, args.filename, sender);
        break;

      case 'rename':
        handleRename(id, args.oldpath, args.newpath, sender);
        break;

      case 'mkdir':
        handleMkdir(id, args.path, sender);
        break;

      case 'rmdir':
        handleRmdir(id, args.path, sender);
        break;

      case 'stat':
        handleStat(id, args.path, args.flags, sender);
        break;

      case 'lstat':
        handleLstat(id, args.path, args.flags, sender);
        break;

      // Extended FSP methods
      case 'watchDir':
        if (!args.dir) {
          console.error('[FSP IPC] Error: dir field is required for watchDir');
          emitError(sender, id, "'dir' field is required");
          return;
        }
        watchDir(id, args.dir, sender);
        break;

      case 'watchFile':
        if (!args.path) {
          console.error('[FSP IPC] Error: path field is required for watchFile');
          emitError(sender, id, "'path' field is required");
          return;
        }
        watchFile(id, args.path, sender);
        break;

      case 'unwatch':
        if (!args.requestId) {
          console.error('[FSP IPC] Error: requestId field is required for unwatch');
          emitError(sender, id, "'requestId' field is required");
          return;
        }
        handleUnwatch(id, args.requestId, sender);
        break;

      case 'dirSize':
        if (!args.dir) {
          console.error('[FSP IPC] Error: dir field is required for dirSize');
          emitError(sender, id, "'dir' field is required");
          return;
        }
        dirSize(id, args.dir, sender);
        break;

      case 'progress':
        if (!args.requestId) {
          console.error('[FSP IPC] Error: requestId field is required for progress');
          emitError(sender, id, "'requestId' field is required");
          return;
        }
        publishProgress(id, args.requestId, sender);
        break;

      case 'fullContent':
        if (!args.path) {
          console.error('[FSP IPC] Error: path field is required for fullContent');
          emitError(sender, id, "'path' field is required");
          return;
        }
        fullContent(id, args.path, sender);
        break;

      // Unimplemented methods - return not implemented error
      case 'fstat':
      case 'setStat':
      case 'setFstat':
      case 'readLink':
      case 'link':
      case 'block':
      case 'unblock':
      case 'realpath':
      case 'textSeek':
        console.warn('[FSP IPC] Not implemented:', type);
        emitError(sender, id, `Method '${type}' is not implemented yet`);
        break;

      default:
        console.error('[FSP IPC] Error: Unknown message type:', type);
        emitError(sender, id, `Unknown message type: ${type}`);
    }
  });
  
  console.log('[FSP IPC] Handlers setup complete');
}
