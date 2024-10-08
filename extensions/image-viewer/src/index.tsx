import { readFile } from "@frdy/sdk";

const root = document.getElementById("root")!;

function resolveMimetype(path: string) {
  const ext = path.split(".").at(-1);

  switch (ext) {
    case "apng":
      return "image/apng";
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    case "jpg":
    case "jpeg":
    case "jfif":
    case "pjpeg":
    case "pjp":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "svg":
      return "image/svg+xml";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    case "ico":
      return "image/x-icon";
    default:
      return undefined;
  }
}

let url: string | undefined;

function revokeURL() {
  if (url) {
    URL.revokeObjectURL(url);
    url = undefined;
  }
}

const load = async (path: string) => {
  console.info("Image loading:", path);
  revokeURL();
  const content = await readFile(faraday.fs, path);
  const img = document.createElement("img");
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  img.style.position = "absolute";
  img.style.top = "50%";
  img.style.left = "50%";
  img.style.transform = "translate(-50%, -50%)";
  const checkerColor = `color-mix(in srgb, transparent, ${faraday.theme.colors["panel.foreground"]} 5%)`;
  img.style.backgroundImage = `linear-gradient(45deg, ${checkerColor} 25%, transparent 25%), linear-gradient(-45deg, ${checkerColor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${checkerColor} 75%), linear-gradient(-45deg, transparent 75%, ${checkerColor} 75%)`;
  img.style.backgroundSize = "20px 20px";
  img.style.backgroundPosition = "0 0, 0 10px, 10px -10px, -10px 0px";

  url = URL.createObjectURL(new Blob([content.buffer], { type: resolveMimetype(path) }));

  img.src = url;

  img.onload = () => {
    root.innerHTML = "";
    root.appendChild(img);
  };
  img.onerror = () => {
    root.innerHTML = "Cannot load the image.";
  };
};

faraday.events.on("activefilechange", load);

if (faraday.activefile) {
  load(faraday.activefile);
}

export function activate() {
  console.info("Image Viewer Activated");
}

export function deactivate() {
  console.info("Image Viewer Deactivated");
  root.innerHTML = "";
  revokeURL();
}
