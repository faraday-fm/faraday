import { useEffect, useErrorBoundary, useState } from "preact/hooks";
import { filestream } from "./filestream";
import { streamToUint8Array } from "./streamToUint8Array";
import { Monaco } from "./monaco";

export function CodeViewer() {
  const [filepath, setFilepath] = useState(faraday.activefile);
  const [content, setContent] = useState("");

  useEffect(() => {
    const onFilepathChange = async (filepath: string) => {
      console.info("activefilechange", filepath);
      setFilepath(filepath);

      try {
        const stream = filestream(faraday.fs, filepath);
        const content = await streamToUint8Array(stream);
        setContent(new TextDecoder().decode(content));
      } catch (e) {
        console.error(e);
      }
    };

    if (faraday.activefile) {
      onFilepathChange(faraday.activefile);
    }

    faraday.events.on("activefilechange", onFilepathChange);

    return () => faraday.events.off("activefilechange", onFilepathChange);
  }, []);

  return (
    <>
      <div>{filepath}</div>
      <Monaco />
      {/* <div style={{ whiteSpace: "pre-wrap" }}>{content}</div> */}
    </>
  );
}

export function CodeViewerWithErrorBoundary() {
  const [error, resetError] = useErrorBoundary();
  return error ? <div>{JSON.stringify(error)}</div> : <CodeViewer />;
}
