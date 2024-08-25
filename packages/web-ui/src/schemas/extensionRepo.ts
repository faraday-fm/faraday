import { array, InferOutput, object, string } from "valibot";

const ExtensionRefSchema = object({
  identifier: object({
    uuid: string(),
  }),
  relativeLocation: string(),
});

export const ExtensionRepoSchema = array(ExtensionRefSchema);

export type ExtensionRepo = InferOutput<typeof ExtensionRepoSchema>;
