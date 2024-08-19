import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "./src/index.tsx",
  output: {
    dir: "./dist",
  },
  plugins: [json(), typescript()],
});
