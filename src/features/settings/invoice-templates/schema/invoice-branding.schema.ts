import z from "zod";

export const BankDetailsSchema = z.object({
  bankName: z.string().optional().nullable(),
  accountName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
});

export const InvoiceBrandingSchema = z.object({
  storeId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),

  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().optional().nullable(),

  supplierName: z.string().optional().nullable(),
  supplierAddress: z.string().optional().nullable(),
  supplierEmail: z.string().email("Invalid email").optional().nullable(),
  supplierPhone: z.string().optional().nullable(),
  supplierTaxId: z.string().optional().nullable(),

  bankDetails: BankDetailsSchema.optional().nullable(),

  footerNote: z.string().optional().nullable(),
});

export type InvoiceBrandingValues = z.infer<typeof InvoiceBrandingSchema>;
