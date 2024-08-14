declare module "*.json5" {
  const value: string;
  export default value;
}

declare module "*.html" {
  const value: string;
  export default value;
}

declare module "*.css" {
  const value: string;
  export default value;
}

declare module "@css" {
  export function css(name: TemplateStringsArray, ...keys: any[]): string;
}
