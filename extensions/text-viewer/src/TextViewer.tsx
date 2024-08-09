import { useEffect, useState } from "preact/hooks";
import { filestream } from "./filestream";
import { streamToUint8Array } from "./streamToUint8Array";

export function TextViewer() {
  const [filepath, setFilepath] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const onFilepathChange = (filepath: string) => {
      console.info("activefilechange", filepath);
      setFilepath(filepath);
      const stream = filestream(faraday.fs, filepath);
      streamToUint8Array(stream).then((content) => setContent(new TextDecoder().decode(content)));
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
