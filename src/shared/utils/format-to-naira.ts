export const formatNaira = (value: number | string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number(value));

export function formatMoneyNGN(value: unknown, currency = "NGN"): string {
  if (value == null) return "—";
  if (typeof value === "string" && /₦|NGN/i.test(value)) return value;

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return "—";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
}

export function formatFromMinorNGN(
  minor: unknown,
  currency: string = "NGN"
): string {
  if (minor == null) return "—";

  const n = Number(minor);
  if (Number.isNaN(n)) return "—";

  // explicit conversion
  const major = n / 100;

  return formatMoneyNGN(major, currency);
}
