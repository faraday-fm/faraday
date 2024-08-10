import { host } from "./bootstrapChannels";

export async function onFocus() {
  await host.onFocus();
}
