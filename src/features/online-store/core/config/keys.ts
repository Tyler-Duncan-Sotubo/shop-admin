export const storefrontKeys = {
  resolved: (storeId?: string) =>
    ["storefront-config", "resolved", storeId ?? "me"] as const,

  publishedOverride: (storeId: string) =>
    ["storefront-config", "override", "published", storeId] as const,

  // ✅ NEW
  themeStatus: (storeId: string) =>
    ["storefront-config", "theme-status", storeId] as const,
};
