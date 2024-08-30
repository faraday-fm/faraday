import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";
import css from "rollup-plugin-import-css";

export default defineConfig([
  {
    input: "./src/index.tsx",
    output: {
      dir: "./dist",
    },
    external: ["@frdy/commands", /^@?lit(\/.*)?/, "jsonc-parser", "@frdy/sdk", "valibot", "clsx", "list", "@xterm/xterm"],
    plugins: [css(), json(), typescript()],
  },
  {
    input: "./src/index.tsx",
    output: {
      file: "./dist/index.full.js",
    },
    plugins: [css({ minify: true }), json(), nodeResolve(), commonjs(), typescript(), terser()],
  },
]);
