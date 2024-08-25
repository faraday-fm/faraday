import { readFile, RealPathControlByte, type FileSystemProvider } from "@frdy/sdk";
import { parse as jsonParse } from "jsonc-parser";
import { BaseIssue, BaseSchema, InferOutput, parse } from "valibot";

export async function readFileString(fs: FileSystemProvider, path: string) {
  const buf = await readFile(fs, path);
  return new TextDecoder().decode(buf);
}

export async function readFileJson<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  fs: FileSystemProvider,
  path: string,
  schema: TSchema
): Promise<InferOutput<typeof schema>> {
  const content = await readFileString(fs, path);
  return parse(schema, jsonParse(content));
}

export async function realpath(fs: FileSystemProvider, originalPath: string, ...composePath: string[]): Promise<string> {
  const dir = await fs.realpath(originalPath, RealPathControlByte.NO_CHECK, composePath);
  return dir.files[0]!.path;
}
