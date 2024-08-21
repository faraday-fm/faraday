export function isDescendant(host: Node, child: Node): boolean {
  let current: Node | null = child;

  while (current) {
      if (current === host) {
          return true;
      }

      const rootNode = current.getRootNode();

      // Move up to the parent node or shadow host
      if (current.parentNode) {
          current = current.parentNode;
      } else if (rootNode instanceof ShadowRoot) {
          current = rootNode.host;
      } else {
          current = null;
      }
  }

  return false;
}