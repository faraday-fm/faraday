import { type InferOutput, any, array, object, optional, string } from "valibot";

export const KeyBindingSchema = object({
  key: string(),
  command: string(),
  when: optional(string()),
  args: optional(any()),
});

export const KeyBindingsSchema = array(KeyBindingSchema);

export type KeyBindingsSchema = InferOutput<typeof KeyBindingsSchema>;
