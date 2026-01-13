export type SetupDomain = {
  domain: string;
  isPrimary?: boolean;
};

export type SetupCreateStorePayload = {
  name: string;
  slug: string;
  defaultCurrency?: "NGN";
  defaultLocale?: "en-NG" | "en-US";
  isActive?: boolean;
  domains: SetupDomain[];
};

export type SetupCreateStoreResponse = {
  store: { id: string; name: string; slug: string };
  domains: Array<{ id: string; domain: string; isPrimary: boolean }>;
  draftOverride?: {
    id: string;
    status: string;
    baseId: string;
    themeId?: string | null;
  };
};
