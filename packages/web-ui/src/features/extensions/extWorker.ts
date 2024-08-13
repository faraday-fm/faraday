function HostLoader() {
  self.addEventListener("message", (m) => {
    const { op, args } = m.data;
    switch (op) {
      case "init": {
        console.error("***", args.script);
      }
    }
  });
}

const hostLoaderUrl = `data:text/javascript;base64,${btoa(`(${HostLoader.toString()})();`)}`;

export function createWorker(script: string) {
  const worker = new Worker(hostLoaderUrl);
  worker.postMessage({ op: "init", args: { script } });
  return {
    terminate: () => worker.terminate(),
  };
}
