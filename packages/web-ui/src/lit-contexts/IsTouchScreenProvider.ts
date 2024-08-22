import { ContextProvider, createContext } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { FrdyElement } from "../components/FrdyElement";

export const isTouchScreenContext = createContext<boolean>(Symbol("is-touch-screen"));

const TAG = "frdy-is-touch-screen-provider";

@customElement(TAG)
export class IsTouchScreenProvider extends FrdyElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  private _mediaQuery?: MediaQueryList;
  private _mediaQueryProvider = new ContextProvider(this, { context: isTouchScreenContext, initialValue: false });

  connectedCallback() {
    super.connectedCallback();
    this._setupMediaQueryListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeMediaQueryListener();
  }

  private _onMediaQueryChange = (event: MediaQueryListEvent) => {
    this._mediaQueryProvider.setValue(event.matches); // Update context value
  };

  _setupMediaQueryListener() {
    this._mediaQuery = window.matchMedia("(pointer: coarse)");
    this._mediaQueryProvider.setValue(this._mediaQuery.matches);
    this._mediaQuery.addEventListener("change", this._onMediaQueryChange);
  }

  _removeMediaQueryListener() {
    this._mediaQuery?.removeEventListener("change", this._onMediaQueryChange);
  }

  render() {
    return html`<slot></slot>`;
  }
}
