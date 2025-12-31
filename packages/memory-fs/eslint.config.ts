import vanilla from "@frdy/eslint-config/vanilla";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    extends: [vanilla],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: new URL(".", import.meta.url).pathname,
      },
    },
  },
]);
