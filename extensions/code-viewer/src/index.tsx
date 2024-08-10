import { render } from "preact";
import { App, type AppRef } from "./App";

const root = document.getElementById("root")!;

export function activate() {
  console.info("Activated");
  appRef?.activate();
}

export function deactivate() {
  console.info("Deactivated");
  appRef?.deactivate();
}

let appRef: AppRef | null;

render(<App ref={(ref: AppRef | null) => (appRef = ref)} />, root);
