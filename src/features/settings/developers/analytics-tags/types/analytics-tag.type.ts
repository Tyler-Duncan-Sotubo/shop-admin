/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnalyticsTag = {
  id: string;
  name: string;
  storeId?: string | null;
  token: string;
  isActive: boolean;
  revokedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  meta?: any;
};

export type CreateAnalyticsTagInput = {
  name: string;
  storeId?: string | null;
};
