export function get<T>(
  obj: T, 
  path: string | Array<string | number>, 
  defaultValue?: any
): any {
  if (!path) return defaultValue;

  const keys: Array<string | number> = Array.isArray(path) ? path : path.split('.');

  let result: any = obj;
  for (const key of keys) {
      result = result?.[key as keyof typeof result];
      if (result === undefined) return defaultValue;
  }

  return result;
}