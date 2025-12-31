import { useSetContextVariable } from "@frdy/commands";
import { AutoHotKeyLabel } from "./AutoHotKeyLabel";
import { Border } from "./Border";
import { Dialog } from "./Dialog";
import { css } from "../features/styles";

interface ErrorDialogProps {
  open: boolean;
  error?: string;
  onClose?: () => void;
}

export function ErrorDialog({ open, error, onClose }: ErrorDialogProps) {
  useSetContextVariable("errorDialog", true, open);

  if (!error) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Error">
      <Border color={"dialog-border"}>
        <div className={css("error-dialog-message")}>
          <div className={css("error-dialog-icon")}>⚠</div>
          <div className={css("error-dialog-text")}>{error}</div>
        </div>
      </Border>
      <Border color={"dialog-border"}>
        <button 
          type="button" 
          className={css("dialog-button")} 
          tabIndex={0}
          onClick={onClose}
          autoFocus
        >
          <AutoHotKeyLabel text="OK" />
        </button>
      </Border>
    </Dialog>
  );
}
