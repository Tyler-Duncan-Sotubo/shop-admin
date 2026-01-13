export type StoreDomain = {
  id: string;
  storeId: string;
  domain: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type UpdateStoreDomainsPayload = {
  domains: Array<{
    domain: string;
    isPrimary?: boolean;
  }>;
};
