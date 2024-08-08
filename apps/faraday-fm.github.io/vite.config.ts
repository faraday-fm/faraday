import { defineConfig, type UserConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { zipFolderPlugin } from "./zipFolderPlugin";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const localLibs = process.env.LOCAL_LIBS === "true";

  let config: UserConfig = {
    plugins: [react(), zipFolderPlugin()],
    build: {
      target: "esnext",
      chunkSizeWarningLimit: 5000,
    },
  };

  if (localLibs) {
    config = {
      ...config,
      optimizeDeps: { exclude: ["@frdy/web-ui"] },
      resolve: {
        alias: {
          "@frdy/web-ui": path.join(__dirname, "../web-ui/dist/index.esm.js"),
        },
      },
    };
  }

  return config;
});
