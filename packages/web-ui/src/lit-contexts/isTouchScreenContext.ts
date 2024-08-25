import { ContextProvider, createContext } from "@lit/context";
import { ReactiveController, ReactiveControllerHost, css, html } from "lit";

export const isTouchScreenContext = createContext<boolean>(Symbol("is-touch-screen"));

export class IsTouchScreenContext<HostElement extends ReactiveControllerHost & HTMLElement> implements ReactiveController {
  #mediaQuery?: MediaQueryList;
  #mediaQueryProvider;

  constructor(host: HostElement) {
    this.#mediaQueryProvider = new ContextProvider(host, { context: isTouchScreenContext, initialValue: false })
    host.addController(this);
  }

  hostConnected(): void {
    this._setupMediaQueryListener();
  }

  hostDisconnected(): void {
    this._removeMediaQueryListener();
  }

  private _onMediaQueryChange = (event: MediaQueryListEvent) => {
    this.#mediaQueryProvider.setValue(event.matches); // Update context value
  };

  _setupMediaQueryListener() {
    this.#mediaQuery = window.matchMedia("(pointer: coarse)");
    this.#mediaQueryProvider.setValue(this.#mediaQuery.matches);
    this.#mediaQuery.addEventListener("change", this._onMediaQueryChange);
  }

  _removeMediaQueryListener() {
    this.#mediaQuery?.removeEventListener("change", this._onMediaQueryChange);
  }

  render() {
    return html`<slot></slot>`;
  }
}
