import type { Dirent } from "@frdy/sdk";
import { css, CSSResultGroup, LitElement } from "lit";
import { property } from "lit/decorators.js";
import "../../../../lit-contexts/GlyphSizeProvider";
import { createList, type List } from "../../../../utils/immutableList";
import "../ColumnCell";
import "../FileName";
import "../MultiColumnList";
import type { CursorStyle } from "../types";
import { TabFilesView } from "../../../../types";
import { consume } from "@lit/context";
import { isTouchScreenContext } from "../../../../lit-contexts/IsTouchScreenProvider";
import { IconsCache, iconsCacheContext } from "../../../../lit-contexts/iconsCacheContext";

export abstract class View<T extends TabFilesView> extends LitElement {
  static styles = css`
    :host {
      display: grid;
      position: relative;
      overflow: hidden;
    }
  ` as CSSResultGroup;

  @property({ attribute: false })
  accessor view: T | undefined;

  @property()
  accessor cursorStyle: CursorStyle;

  @property({ attribute: false })
  accessor items: List<Dirent>;

  @property({ attribute: false })
  accessor selectedItemNames: List<string>;

  @consume({ context: iconsCacheContext })
  accessor icons!: IconsCache;

  @consume({ context: isTouchScreenContext, subscribe: true })
  accessor isTouchscreen!: boolean;

  constructor() {
    super();
    this.cursorStyle = "firm";
    this.items = createList();
    this.selectedItemNames = createList();
  }
}
