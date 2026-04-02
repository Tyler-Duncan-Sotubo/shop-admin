// shared/ui/bulk-upload/detect-shopify.ts

const SHOPIFY_MAP: Record<string, string> = {
  "First Name": "firstName",
  "Last Name": "lastName",
  Email: "email",
  Phone: "phone",
  "Default Address Phone": "phone", // fallback if Phone empty
  "Default Address Address1": "address",
  "Default Address Company": "company",
  Note: "note",
  "Accepts Email Marketing": "marketingOptIn",
};

export function isShopifyExport(headers: string[]): boolean {
  return (
    headers.includes("Customer ID") &&
    headers.includes("Accepts Email Marketing")
  );
}

export function buildAutoMapping(
  headers: string[],
  targetFields: { key: string }[],
): Record<string, string> {
  const mapping: Record<string, string> = {};

  // Auto-map Shopify columns
  if (isShopifyExport(headers)) {
    for (const header of headers) {
      const target = SHOPIFY_MAP[header];
      if (target) mapping[header] = target;
    }
    return mapping;
  }

  // Generic auto-map: fuzzy match header → target field key
  for (const header of headers) {
    const normalized = header.toLowerCase().replace(/[\s_-]/g, "");
    const match = targetFields.find(
      (f) =>
        f.key.toLowerCase() === normalized ||
        f.key.toLowerCase().replace(/[\s_-]/g, "") === normalized,
    );
    if (match) mapping[header] = match.key;
  }

  return mapping;
}
