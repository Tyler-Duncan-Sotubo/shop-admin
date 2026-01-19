export const storefrontConfigRoutes = {
  resolvedConfig: (storeId?: string) =>
    `/api/storefront-config/admin/stores/${storeId}/config?mode=draft`,

  publishedOverride: (storeId: string) =>
    `/api/storefront-config/admin/stores/${storeId}/override`,
  upsertOverride: (storeId: string) =>
    `/api/storefront-config/admin/stores/${storeId}/override`,

  publishDraft: (storeId: string) =>
    `/api/storefront-config/admin/stores/${storeId}/override/publish`,

  // ✅ NEW
  themeStatus: (storeId: string) =>
    `/api/storefront-config/admin/stores/${storeId}/theme-status`,
};
