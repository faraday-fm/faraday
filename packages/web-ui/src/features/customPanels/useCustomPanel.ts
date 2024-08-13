import { filename, getAllExtensions } from "../../utils/path";
import { useCustomPanelsByFileExtension } from "./useCustomPanelsByFileExtension";
import { useCustomPanelsByFileName } from "./useCustomPanelsByFileName";
import { useCustomPanelsByMimetype } from "./useCustomPanelsByMimetype";

export function useCustomPanel(filePath: string | undefined, mimetype?: string) {
  const qvByFileName = useCustomPanelsByFileName();
  const qvByFileExtension = useCustomPanelsByFileExtension();
  const qvByFileMimetype = useCustomPanelsByMimetype();

  if (!filePath) {
    return undefined;
  }

  const fileName = filename(filePath);
  if (!fileName) {
    return undefined;
  }

  if (qvByFileName[fileName] && qvByFileName[fileName].length > 0) {
    return qvByFileName[fileName][0];
  }

  for (const ext of getAllExtensions(fileName, true)) {
    if (qvByFileExtension[ext] && qvByFileExtension[ext].length > 0) {
      return qvByFileExtension[ext][0];
    }
  }

  if (mimetype) {
    if (qvByFileMimetype[mimetype] && qvByFileMimetype[mimetype].length > 0) {
      return qvByFileMimetype[mimetype][0];
    }
  }

  return undefined;
}
