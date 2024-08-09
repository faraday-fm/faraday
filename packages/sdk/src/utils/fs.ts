import { filestream } from "./filestream";
import { streamToUint8Array } from "./streamToUint8Array";

export async function readFile(path: string, options?: { signal?: AbortSignal }) {
  const stream = filestream(faraday.fs, path, options?.signal);
  return streamToUint8Array(stream);
}
