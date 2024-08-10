import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path = (relPath: string) => join(__dirname, relPath);

export default defineConfig({
  entry: ["src/index.tsx"],
  tsconfig: "tsconfig.app.json",
  splitting: false,
  minify: true,
  clean: ["dist", "publish"],
  noExternal: [/(.*)/],
  format: ["esm"],
  onSuccess: async () => {
    const packageJson = JSON.parse(await readFile(path("package.json"), { encoding: "utf-8" }));
    // const publishDir = join("publish", `${packageJson.publisher}.${packageJson.name}-${packageJson.version}`);
    const publishDir = "publish";
    // await rm(path(publishDir), { recursive: true, force: true });
    await mkdir(path(publishDir), { recursive: true });
    // biome-ignore lint/performance/noDelete: <explanation>
    delete packageJson.scripts;
    // biome-ignore lint/performance/noDelete: <explanation>
    delete packageJson.dependencies;

    // biome-ignore lint/performance/noDelete: <explanation>
    delete packageJson.devDependencies;
    await writeFile(path(join(publishDir, "package.json")), JSON.stringify(packageJson, undefined, "  "));
    await cp(path("dist"), path(join(publishDir, "dist")), { recursive: true, force: true });
  },
});
