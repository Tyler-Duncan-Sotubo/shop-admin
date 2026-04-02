// shared/ui/bulk-upload/parse-file.ts
import * as XLSX from "xlsx";

export async function parseFile(file: File): Promise<{
  headers: string[];
  rows: Record<string, string>[];
}> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  if (!raw.length) return { headers: [], rows: [] };

  // Strip leading apostrophes Shopify adds (e.g. '22549742453028 → 22549742453028)
  const cleaned = raw.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [
        k,
        typeof v === "string" ? v.replace(/^'/, "").trim() : v,
      ]),
    ),
  );

  const headers = Object.keys(cleaned[0]);
  return { headers, rows: cleaned };
}
