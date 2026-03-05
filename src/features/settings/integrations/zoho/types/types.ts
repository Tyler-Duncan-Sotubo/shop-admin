// types file (optional): src/app/(admin)/integrations/zoho/types.ts
export type ZohoRegion = "com" | "eu" | "in" | "com.au" | "jp" | "ca" | "sa";

export type ZohoRow = {
  id: string;
  storeId: string;
  companyId: string;
  region: ZohoRegion;
  isActive: boolean;
  zohoOrganizationId?: string | null;
  zohoOrganizationName?: string | null;
  connectedAt?: string;
  disconnectedAt?: string | null;
  lastError?: string | null;
};
