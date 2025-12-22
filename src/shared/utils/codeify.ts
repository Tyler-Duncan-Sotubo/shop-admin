export function codeify(value: string, index = 1) {
  const base = value
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 16);

  const suffix = String(index).padStart(3, "0");

  return `${base}-${suffix}`;
}
