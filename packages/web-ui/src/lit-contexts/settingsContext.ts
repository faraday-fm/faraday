import { type FileSystemProvider } from "@frdy/sdk";
import { createContext } from "@lit/context";
import { Settings } from "../schemas/settings";
import { readFileJson } from "./fsUtils";

export type SettingsContext = {
  settings: Promise<Settings>;
};

export const settingsContext = createContext<SettingsContext>(Symbol("settings"));

export function createSettingsContext(fs: FileSystemProvider): SettingsContext {
  return { settings: readFileJson(fs, ".faraday/settings.json", Settings) };
}
