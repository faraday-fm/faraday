import { type ReactEventHandler, useEffect, useId, useRef } from "react";
import { QuickNavigationProvider } from "../../contexts/quickNavigationContext";
import { AutoHotKeyLabel } from "../AutoHotKeyLabel";
import { Border } from "../Border";
import { dialogBackdrop, dialogButton, dialogContent, dialogTitle } from "./css";


interface CopyDialogProps {
  open: boolean;
  onClose?: () => void;
}

export default function DeleteDialog({ open, onClose }: CopyDialogProps) {
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  const handleCancel: ReactEventHandler = (e) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <QuickNavigationProvider>
      <dialog className={dialogBackdrop} ref={dialogRef} onMouseDown={() => onClose?.()} onCancel={handleCancel} {...{ popover: "manual" }}>
        <div className={dialogTitle}>Delete</div>
        <div className={dialogContent} onMouseDown={(e) => e.stopPropagation()}>
          <Border color={"dialog-border"}>
            <Border color={"dialog-border"}>
              <p style={{ display: "flex", flexDirection: "column" }}>
                <AutoHotKeyLabel text="Copy to:" htmlFor={`${dialogId}copyTo`} />
                <input id={`${dialogId}copyTo`} />
              </p>
            </Border>
            <Border color={"dialog-border"}>
              <p>
                <AutoHotKeyLabel text="Already existing files:" htmlFor={`${dialogId}alreadyExisting`} />
                <input id={`${dialogId}alreadyExisting`} />
              </p>
              <p>
                <input id={`${dialogId}processMultDist`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Process multiple destinations" htmlFor={`${dialogId}processMultDist`} />
              </p>
              <p>
                <input id={`${dialogId}copyAccessMode`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Copy files access mode" htmlFor={`${dialogId}copyAccessMode`} />
              </p>
              <p>
                <input id={`${dialogId}copyAttributes`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Copy extended attributes" htmlFor={`${dialogId}copyAttributes`} />
              </p>
              <p>
                <input id={`${dialogId}disableCache`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Disable write cache" htmlFor={`${dialogId}disableCache`} />
              </p>
              <p>
                <input id={`${dialogId}sparseFiles`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Produce sparse files" htmlFor={`${dialogId}sparseFiles`} />
              </p>
              <p>
                <input id={`${dialogId}useCopyOnWrite`} type="checkbox" tabIndex={0} />
                <AutoHotKeyLabel text="Use copy-on-write if possible" htmlFor={`${dialogId}useCopyOnWrite`} />
              </p>
              <p>
                <AutoHotKeyLabel text="With symlinks:" />
              </p>
            </Border>
          </Border>
          <Border color={"dialog-border"}>
            <button type="button" className={dialogButton} id={`${dialogId}copy`} tabIndex={0}>
              <AutoHotKeyLabel text="Copy" htmlFor={`${dialogId}copy`} />
            </button>
            <button type="button" className={dialogButton} id={`${dialogId}tree`} tabIndex={0}>
              <AutoHotKeyLabel text="F10-Tree" htmlFor={`${dialogId}tree`} />
            </button>
            <button type="button" className={dialogButton} id={`${dialogId}filter`} tabIndex={0}>
              <AutoHotKeyLabel text="Filter" htmlFor={`${dialogId}filter`} />
            </button>
            <button type="button" className={dialogButton} id={`${dialogId}cancel`} tabIndex={0}>
              <AutoHotKeyLabel text="Cancel" htmlFor={`${dialogId}cancel`} />
            </button>
          </Border>
        </div>
      </dialog>
    </QuickNavigationProvider>
  );
}
