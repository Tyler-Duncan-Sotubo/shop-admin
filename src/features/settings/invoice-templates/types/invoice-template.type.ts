/* eslint-disable @typescript-eslint/no-explicit-any */
export type InvoiceTemplate = {
  id: string;
  key: string;
  version: string;
  name: string;
  engine: "handlebars" | string;
  content: string;
  css: string | null;
  isActive: boolean;
  isDeprecated: boolean;
  isDefault: boolean;
  meta: any;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceBranding = {
  companyId?: string;
  storeId?: string | null;

  templateId?: string | null;

  logoUrl?: string | null;
  primaryColor?: string | null;

  supplierName?: string | null;
  supplierAddress?: string | null;
  supplierEmail?: string | null;
  supplierPhone?: string | null;
  supplierTaxId?: string | null;

  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  } | null;

  footerNote?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export type PreviewHtmlResponse = {
  html: string;
  template: {
    id: string;
    key: string;
    version: string;
    name: string;
  };
  brandingUsed: InvoiceBranding | null;
  usingDefaultTemplate: boolean;
};
