import "./index.css";
import EventEmitter from "eventemitter3";

const EE = new EventEmitter();

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const wnd = window as any;

function showError(err: unknown) {
  let errorText = "";
  if (typeof err === "string") errorText = err;
  else if (err instanceof Error) errorText = err.message;
  errorMessage.style.visibility = "visible";
  errorMessage.innerText = errorText;
}

const pm = window.parent.postMessage.bind(window.parent);
const { resolve: resolveModule, promise: modulePromise } = Promise.withResolvers();
const errorMessage = document.createElement("div");
errorMessage.style.position = "fixed";
errorMessage.style.inset = "0";
errorMessage.style.background = "#fffc";
errorMessage.style.zIndex = "1";
errorMessage.style.visibility = "collapse";
document.body.appendChild(errorMessage);
addEventListener("focus", () => pm("focus", "*"));
addEventListener("message", async (e) => {
  switch (e.data?.type) {
    case "theme": {
      const theme = e.data.theme;
      faraday.theme = theme;
      const style = document.getElementById("default_style")!;
      style.innerHTML = `body{font-family:${e.data.theme.fontFamily};background-color:${e.data.theme.colors["panel.background"]};color:${e.data.theme.colors.foreground}}a{color:${theme.colors["textLink.foreground"]}}`;
      EE.emit("themechange", theme);
      break;
    }
    case "init": {
      if (e.data.js) {
        try {
          const m = await import(`data:text/javascript;base64,${btoa(e.data.js)}`);
          m.init?.();
          resolveModule(m);
        } catch (err) {
          showError(err);
        }
      }
      break;
    }
    case "content": {
      errorMessage.style.visibility = "collapse";
      try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const module: any = await modulePromise;
        module.updateContent?.({ content: e.data.content, path: e.data.path });
      } catch (err) {
        showError(err);
      }
      break;
    }
  }
});
// biome-ignore lint/performance/noDelete: <explanation>
delete wnd.parent;

wnd.faraday = {
  theme: "",
  events: EE,
  fs: {
    readFile(filename: string) {
      return Promise.resolve(filename);
    },
  },
} satisfies typeof faraday;
