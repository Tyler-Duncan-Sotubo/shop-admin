export const toStr = (v: unknown, fallback = ""): string => {
  if (v === null || v === undefined) return fallback;
  return typeof v === "string" ? v : String(v);
};

export const toStrOrEmpty = (v: unknown) => toStr(v, "");
export const toStrOrZero = (v: unknown) => toStr(v, "0");

export const numToStr = (v: number | null | undefined) =>
  v === null || v === undefined ? "" : String(v);
