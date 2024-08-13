import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import ts from "rollup-plugin-typescript2";
import { string } from "./scripts/string.mjs";

const watch = !!process.env.ROLLUP_WATCH;

export default defineConfig([
  {
    input: "src/worker.ts",
    output: [
      {
        file: "dist/extension-host.js.txt",
        format: "esm",
      },
    ],
    context: "window",
    plugins: [terser(), nodeResolve({ browser: true }), ts()],
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "esm",
      },
    ],
    context: "window",
    external: ["comlink"],
    plugins: [!watch && terser(), ts(), string({ include: "**/*.txt" })],
  },
]);
