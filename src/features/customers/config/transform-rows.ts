// shared/ui/bulk-upload/transform-rows.ts

export function transformRows(
  rows: Record<string, string>[],
  mapping: Record<string, string>, // csvColumn → targetField
): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {};

    for (const [csvCol, targetField] of Object.entries(mapping)) {
      if (!targetField) continue;
      const val = row[csvCol]?.trim() ?? "";

      // Don't overwrite if already set (handles phone fallback)
      if (out[targetField] && !val) continue;
      if (val) out[targetField] = val;
    }

    // Normalise marketingOptIn: "yes" → "true"
    if (out.marketingOptIn !== undefined) {
      out.marketingOptIn =
        out.marketingOptIn.toLowerCase() === "yes" ? "true" : "false";
    }

    return out;
  });
}
