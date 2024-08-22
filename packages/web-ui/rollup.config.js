import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";

export default defineConfig([
  {
    input: "./src/index.tsx",
    output: {
      dir: "./dist",
    },
    plugins: [json(), typescript()],
  },
  {
    input: "./src/index.tsx",
    output: {
      file: "./dist/index.full.js",
    },
    plugins: [json(), nodeResolve(), commonjs(), typescript(), terser()],
  },
]);
