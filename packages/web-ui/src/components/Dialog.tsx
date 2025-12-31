import { type ReactEventHandler, type ReactNode, useEffect, useRef } from "react";
import { css } from "../features/styles";

interface DialogProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
}

export function Dialog({ open, onClose, children, title }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      // Store the currently focused element before opening
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      // Restore focus after dialog closes
      setTimeout(() => {
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
          previousActiveElementRef.current = null;
        }
      }, 0);
      onClose?.();
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleCancel: ReactEventHandler = (e) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <dialog 
      className={css("dialog-backdrop")} 
      ref={dialogRef} 
      onMouseDown={() => onClose?.()} 
      onCancel={handleCancel} 
      {...{ popover: "manual" }}
    >
      <div className={css("dialog-content")} onMouseDown={(e) => e.stopPropagation()}>
        {title && <div className={css("dialog-title")}>{title}</div>}
        {children}
      </div>
    </dialog>
  );
}
