// types/company-account.type.ts

export type CompanyAccount = {
  id: string;

  // identity
  name: string;
  slug: string;
  legalName: string | null;
  country: string | null;
  vatNumber: string | null;

  // defaults / locale
  defaultCurrency: string;
  timezone: string;
  defaultLocale: string;

  // billing
  billingEmail: string | null;
  billingCustomerId: string | null;
  billingProvider: string | null;

  // subscription
  plan: string;
  trialEndsAt: string | null; // ISO string

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type UpdateCompanyAccountPayload = Partial<{
  slug: string;
  legalName: string | null;
  vatNumber: string | null;
  defaultCurrency: string;
  timezone: string;
  defaultLocale: string;
  billingEmail: string | null;
  plan: string;
}>;
