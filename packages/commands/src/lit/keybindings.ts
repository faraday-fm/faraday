// import { css, CSSResultGroup, html, LitElement } from "lit";
// import { customElement, property } from "lit/decorators.js";
// import { KeyBindingsSchema } from "../schema";

// const TAG = "frdy-keybindings";

// const getModifiers = (e: KeyboardEvent) => {
//   return [e.ctrlKey ? "Ctrl" : "", e.altKey ? "Alt" : "", e.shiftKey ? "Shift" : "", e.metaKey ? "Meta" : ""].filter((m) => m).join("+");
// };

// @customElement(TAG)
// export class KeyBindings extends LitElement {
//   static styles = css`
//     :host {
//       display: contents;
//     }
//   `;

//   @property({ attribute: false })
//   accessor bindings: KeyBindingsSchema | undefined;

//   connectedCallback(): void {
//     window.addEventListener("keydown", this.onKeyDown, { capture: true });
//   }

//   disconnectedCallback(): void {
//     window.removeEventListener("keydown", this.onKeyDown, { capture: true });
//   }

//   onKeyDown = (e: KeyboardEvent) => {
//     if (!this.bindings) {
//       return;
//     }
//     const modifiers = getModifiers(e);
//       const keyCombination = modifiers ? `${modifiers}+${e.code}` : e.code;
//       console.debug("Key pressed:", e.key, "(", keyCombination, ")");
//       for (let i = this.bindings.length - 1; i >= 0; i -= 1) {
//         const binding = this.bindings[i]!;
//         if (binding.key === keyCombination && (!binding.when || isInContext(binding.when))) {
//           if (binding.args != null) {
//             console.debug(binding.command, "(", JSON.stringify(binding.args), ")");
//           } else {
//             console.debug(binding.command, "()");
//           }
//           executeCommand(binding.command, binding.args);
//           e.stopPropagation();
//           e.preventDefault();
//           break;
//         }
//       }
//   };

//   protected render() {
//     return html`<slot></slot>`;
//   }
// }

// declare global {
//   interface HTMLElementTagNameMap {
//     [TAG]: KeyBindings;
//   }
// }
