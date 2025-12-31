import type { FspResponse } from './types';

export function emitResponse(
  sender: (response: FspResponse) => void,
  requestId: number,
  payloadField: string,
  payload: any
): void {
  const response: FspResponse = {
    id: requestId,
    [payloadField]: payload
  };
  sender(response);
}

export function emitOkResponse(
  sender: (response: FspResponse) => void,
  requestId: number,
  payload: any
): void {
  emitResponse(sender, requestId, 'result', payload);
}

export function emitError(
  sender: (response: FspResponse) => void,
  requestId: number,
  message: string
): void {
  emitResponse(sender, requestId, 'error', message);
}
