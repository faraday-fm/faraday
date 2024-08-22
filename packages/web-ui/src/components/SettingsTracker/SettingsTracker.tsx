// import { memo, useEffect } from "react";
// import { useFileJsonContent } from "../../features/fs/useFileJsonContent";
// import { useSettings } from "../../features/settings/settings";
// import { Settings } from "../../schemas/settings";

// export const SettingsTracker = memo(function SettingsTracker({ path }: { path: string }) {
//   const settings = useFileJsonContent(path, Settings);
//   const { setIconThemeId, setLang } = useSettings();

//   useEffect(() => {
//     if (settings.content) {
//       setIconThemeId(settings.content.iconThemeId);
//       setLang(settings.content.lang ?? "en");
//     }
//   }, [setIconThemeId, setLang, settings.content]);

//   return null;
// });
