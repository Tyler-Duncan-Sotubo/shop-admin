/* eslint-disable @typescript-eslint/no-explicit-any */
export type ContactEmailStatus = "new" | "read" | "archived" | "spam";

export type ContactEmailRow = {
  id: string;
  companyId: string;
  storeId: string | null;

  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;

  message: string;
  status: ContactEmailStatus;
  subject: string | null;

  metadata?: {
    ip?: string;
    userAgent?: string;
    pageUrl?: string;
    referrer?: string;
    [k: string]: any;
  } | null;

  createdAt: string | Date;
  updatedAt: string | Date;
};
