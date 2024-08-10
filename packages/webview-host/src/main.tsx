import { readFile, RealPathControlByte, type FileSystemProvider } from "@frdy/sdk";
import "./actions";
import { EE, startActionsListener } from "./actions";
import { fs } from "./bootstrapChannels";
import { onFocus } from "./events";
import "./index.css";
import { settings } from "./settings";
import { setError } from "./error";

addEventListener("focus", onFocus);

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const wnd = window as any;

// biome-ignore lint/performance/noDelete: <explanation>
delete wnd.parent;

wnd.faraday = {
  theme: settings.theme,
  activefile: settings.activeFilepath,
  events: EE,
  fs: fs as FileSystemProvider,
} satisfies typeof faraday;

async function importModule() {
  const rp = await faraday.fs.realpath(settings.pwd, RealPathControlByte.NO_CHECK, [settings.scriptPath]);
  const result = await readFile(rp.files[0].path);
  const blob = new Blob([result], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return await import(url);
}

try {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const module = await importModule() as any;
  await startActionsListener(module);

} catch (err) {
  console.error(err);
  setError(err);
}
