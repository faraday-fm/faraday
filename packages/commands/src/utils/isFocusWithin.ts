export function isFocusWithin(host: Element, child: Element | null) {
  let el = child;
  while (el && el !== host) {
    el = el.parentElement;
  }
  return el === host;
}
