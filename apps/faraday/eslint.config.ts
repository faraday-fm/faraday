import react from "@frdy/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    extends: [react],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: new URL(".", import.meta.url).pathname,
      },
    },
  },
]);
