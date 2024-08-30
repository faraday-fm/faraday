import { Terminal, TerminalSession } from "@frdy/web-ui";
import { ws } from "./wsTransport";

let requestIdCounter = 1;

const pool = new Map<number, PromiseWithResolvers<any>>();

// function base64ToArray(base64: string) {
//   var binaryString = atob(base64);
//   var bytes = new Uint8Array(binaryString.length);
//   for (var i = 0; i < binaryString.length; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }
//   return bytes;
// }

ws.addEventListener("message", (m) => {
  const msg = JSON.parse(m.data);
  const { scope, type, data, id, result, error } = msg;
  if (scope !== "terminal") {
    return;
  }
  if (type === "notification") {
    const x = sessionsById.get(data?.sessionId);
    x?.onData(data.data);
  } else if (type === "rpc") {
    const task = pool.get(id);
    if (task) {
      pool.delete(id);
      if (error) {
        task.reject(error);
      } else {
        task.resolve(result);
      }
    }
  }
});

function invokeRequest(type: string, args: any, signal?: AbortSignal) {
  const requestId = requestIdCounter;
  if (signal?.aborted) {
    throw new Error("aborted");
  }
  signal?.addEventListener("abort", () => {
    pool.delete(requestId);
    task.reject("aborted");
  });
  requestIdCounter++;
  const task = Promise.withResolvers<any>();
  pool.set(requestId, task);
  ws.send(JSON.stringify({ scope: "terminal", type, requestId, ...args }));
  return task.promise;
}

const sessionIds = new Map<TerminalSession, string>();
const sessionsById = new Map<string, { onData: (data: string) => void }>();
var decoder = new TextDecoder("utf8");

export const term: Terminal = {
  async createSession(command, cwd, onData, initialTtySize) {
    const sessionId = await invokeRequest("createSession", { command, cwd, ...initialTtySize });
    const session = Symbol();
    sessionIds.set(session, sessionId);
    sessionsById.set(sessionId, { onData });
    return session;
  },
  async destroySession(session) {
    const sessionId = sessionIds.get(session);
    sessionIds.delete(session);
    if (sessionId != null) {
      sessionsById.delete(sessionId);
      await invokeRequest("destroySession", { sessionId });
    }
  },
  async setTtySize(session, size) {
    const sessionId = sessionIds.get(session);
    if (sessionId != null) {
      await invokeRequest("setTtySize", { sessionId, ...size });
    }
  },
  async sendData(session, data): Promise<void> {
    const sessionId = sessionIds.get(session);
    if (sessionId != null) {
      await invokeRequest("sendData", { sessionId, data });
    }
  },
};
