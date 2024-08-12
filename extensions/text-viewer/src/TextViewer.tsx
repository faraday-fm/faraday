import { readFile } from "@frdy/sdk";
import { useEffect, useState } from "preact/hooks";

export function TextViewer() {
  const [filepath, setFilepath] = useState(faraday.activefile);
  const [content, setContent] = useState("");

  useEffect(() => {
    const onFilepathChange = (filepath: string) => {
      console.info("activefilechange", filepath);
      setFilepath(filepath);
      readFile(faraday.fs, filepath).then((content) => setContent(new TextDecoder().decode(content)));
    };
    faraday.events.on("activefilechange", onFilepathChange);

    return () => faraday.events.off("activefilechange", onFilepathChange);
  }, []);

  return (
    <>
      <div>{filepath}</div>
      <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
    </>
  );
}
