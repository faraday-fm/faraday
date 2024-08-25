export function clamp(min: number, cur: number, max: number) {
  return Math.max(min, Math.min(cur, max));
}

const sizes = ["B", "K", "M", "G", "T", "P", "E"];

export function bytesToSize(bytes: number, maxBytes?: number) {
  if (maxBytes && bytes <= maxBytes) return bytes.toString();
  if (bytes === 0) return "0 B";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** i;

  // Round to 3 significant digits
  const roundedValue = Math.round(value * 100) / 100;

  return `${roundedValue} ${sizes[i]}`;
}