import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "./src/index.ts",
  output: {
    dir: "./dist",
  },
  plugins: [json(), typescript()],
});
