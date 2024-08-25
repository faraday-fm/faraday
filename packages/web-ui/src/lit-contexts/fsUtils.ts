import { readFile, RealPathControlByte, type FileSystemProvider } from "@frdy/sdk";
import { parse as jsonParse } from "jsonc-parser";
import { BaseIssue, BaseSchema, InferOutput, parse } from "valibot";

export async function readFileString(fs: FileSystemProvider, path: string, options?: { signal?: AbortSignal }) {
  const buf = await readFile(fs, path, options);
  return new TextDecoder().decode(buf);
}

export async function readFileJson<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  fs: FileSystemProvider,
  path: string,
  schema: TSchema,
  options?: { signal?: AbortSignal }
): Promise<InferOutput<typeof schema>> {
  const content = await readFileString(fs, path, options);
  return parse(schema, jsonParse(content));
}

export async function realpath(fs: FileSystemProvider, originalPath: string, composePath: string[], options?: { signal?: AbortSignal }): Promise<string> {
  const dir = await fs.realpath(originalPath, RealPathControlByte.NO_CHECK, composePath, options);
  return dir.files[0]!.path;
}
