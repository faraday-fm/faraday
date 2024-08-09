import { render } from "preact";
import { TextViewer } from "./TextViewer";

export function init() {
  console.info("Text Viewer inited");

  render(<TextViewer />, document.getElementById("root")!);
}
