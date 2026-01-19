/* eslint-disable @typescript-eslint/no-explicit-any */
export type StorefrontConfigV1 = Record<string, any>;

export type StorefrontOverrideStatus = "draft" | "published";

export type StorefrontOverridesV1 = {
  theme?: {
    assets?: { logoUrl?: string };
    [k: string]: any; // passthrough
  };
  seo?: {
    title?: string;
    description?: string;
    siteName?: string;
    canonicalBaseUrl?: string;
    ogImage?: { url?: string; alt?: string };
  };
  header?: any;
  footer?: any;
  pages?: any;
  ui?: {
    headerMenu?: {
      about?: boolean;
      contact?: boolean;
      blog?: boolean;
    };
    [k: string]: any; // passthrough
  };
};

export type StorefrontOverrideRow = {
  id: string;
  companyId: string;
  storeId: string;
  baseId: string;
  themeId: string | null;
  status: StorefrontOverrideStatus;

  theme: Record<string, any>;
  ui: Record<string, any>;
  seo: Record<string, any>;
  header: Record<string, any>;
  footer: Record<string, any>;
  pages: Record<string, any>;

  publishedAt: string | null;
  updatedAt: string;
};
