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
  currency: string = "NGN",
): string {
  if (minor == null) return "—";

  const n = Number(minor);
  if (Number.isNaN(n)) return "—";

  const major = n / 100;

  return formatMoneyNGN(major, currency);
}

export function fmtCompactMajor(value: unknown, currency = "NGN"): string {
  if (value == null) return "—";

  const n = Number(value);
  if (Number.isNaN(n)) return "—";

  const abs = Math.abs(n);
  const symbol = getCurrencySymbol(currency);

  if (abs >= 1_000_000_000)
    return `${symbol}${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${symbol}${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${(n / 1_000).toFixed(1)}K`;

  return formatMoneyNGN(n, currency);
}

function getCurrencySymbol(currency: string): string {
  try {
    const symbol = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value;

    // Intl sometimes returns the ISO code instead of the symbol
    if (!symbol || symbol === currency) {
      if (currency === "NGN") return "₦";
      if (currency === "USD") return "$";
      if (currency === "GBP") return "£";
      if (currency === "EUR") return "€";
      return currency;
    }

    return symbol;
  } catch {
    if (currency === "NGN") return "₦";
    return currency;
  }
}
