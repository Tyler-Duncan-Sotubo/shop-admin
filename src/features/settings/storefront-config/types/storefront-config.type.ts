/* eslint-disable @typescript-eslint/no-explicit-any */
export type StorefrontTheme = {
  colors?: { brand?: string; background?: string; text?: string };
  button?: { radius?: number; style?: "solid" | "outline" | "ghost" };
  logoUrl?: string;
};

export type StorefrontHeader = {
  variant?: "leftLogo" | "centerLogo";
  links?: Array<{ label: string; href: string }>;
  showSearch?: boolean;
  sticky?: boolean;
};

export type StorefrontPages = {
  home?: { sections?: any[] };
  collection?: {
    ui?: {
      header?: {
        variant?: "simple" | "withDescription";
        showDescription?: boolean;
      };
      layout?: {
        variant?: "sidebarFilters" | "topFilters";
        sidebarWidth?: number;
      };
      sections?: {
        exploreMore?: { enabled: boolean };
        afterContent?: { enabled: boolean };
      };
    };
    data?: { perPage?: number };
  };
};

export type StorefrontConfig = {
  storeId: string;
  theme: StorefrontTheme;
  header: StorefrontHeader;
  pages: StorefrontPages;
  updatedAt?: string | null;
};

export type UpdateStorefrontConfigPayload = {
  theme?: StorefrontTheme;
  header?: StorefrontHeader;
  pages?: StorefrontPages;
};
