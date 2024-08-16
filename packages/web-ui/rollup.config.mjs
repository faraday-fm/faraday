import path from "node:path";
import { fileURLToPath } from "node:url";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import ts from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import { string } from "./scripts/string.mjs";
import { babel } from "@rollup/plugin-babel";
import { compileLitTemplates } from "@lit-labs/compiler";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const projectRootDir = path.resolve(dirname);

const watch = !!process.env.ROLLUP_WATCH;

export default defineConfig({
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.cjs.js",
      sourcemap: !watch,
      format: "cjs",
    },
    {
      file: "dist/index.esm.js",
      sourcemap: !watch,
      format: "esm",
    },
  ],
  external: ["react", "react/jsx-runtime", "fast-deep-equal", "parsimmon", "jotai", "valibot", "list", "json5", "is-promise"],
  context: "window",
  plugins: [
    !watch && del({ targets: ["dist/*"] }),
    json(),
    ts({
      sourceMap: !watch,
      // transformers: {
      //   before: [compileLitTemplates()],
      // },
    }),
    nodeResolve({ browser: true }),
    alias({
      entries: [
        {
          find: "@assets",
          replacement: path.resolve(projectRootDir, "src/assets"),
        },
      ],
    }),
    commonjs(),
    string({ include: "**/*.{json5,html,css}" }),
    babel({ babelHelpers: "bundled", extensions: [".js", ".jsx", ".ts", ".tsx"] }),
    !watch && terser(),
  ],
});
