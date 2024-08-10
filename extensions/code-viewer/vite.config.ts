import { defineConfig } from "vite";
import { resolve } from "node:path";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  esbuild: { minify: true as any },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "lib/main.ts"),
      fileName: "code-viewer",
      formats: ["es"],
    },
  },
});
