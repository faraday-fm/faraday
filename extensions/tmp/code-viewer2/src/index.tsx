import { render } from "preact";
import { CodeViewerWithErrorBoundary } from "./CodeViewer";

export function init() {
  console.info("Code Viewer inited.", faraday.activefile);

  render(<CodeViewerWithErrorBoundary  />, document.getElementById("root")!);
}
