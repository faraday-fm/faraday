import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "./src/index.ts",
  output: {
    dir: "./dist",
  },
  // external: ["jsep", "@lit/context"],
  plugins: [json(), typescript(), nodeResolve(), terser()],
});
