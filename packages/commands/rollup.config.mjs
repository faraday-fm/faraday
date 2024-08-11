import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import ts from "rollup-plugin-typescript2";
import { string } from "./scripts/string.mjs";

const watch = !!process.env.ROLLUP_WATCH;

export default defineConfig({
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.esm.js",
      sourcemap: !watch,
      format: "esm",
    },
  ],
  external: ["react", "react/jsx-runtime", "fast-deep-equal", "parsimmon", "immer", "valibot", "jotai", "json5", "is-promise"],
  context: "window",
  plugins: [
    !watch && [terser({ sourceMap: !watch }), del({ targets: ["dist/*"] })],
    json(),
    nodeResolve({ browser: true }),
    commonjs(),
    ts({ sourceMap: !watch }),
    string({ include: "**/*.{json5,html,css}" }),
  ],
});
