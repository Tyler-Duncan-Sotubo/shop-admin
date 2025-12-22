import z from "zod";

export const customerDetailsSchema = z.object({
  firstName: z.string().trim().optional().or(z.literal("")),
  lastName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  marketingOptIn: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type CustomerDetailsFormValues = z.infer<typeof customerDetailsSchema>;

export const customerAddressSchema = z.object({
  label: z.string().trim().optional().or(z.literal("")),
  firstName: z.string().trim().optional().or(z.literal("")),
  lastName: z.string().trim().optional().or(z.literal("")),
  line1: z.string().trim().min(1, "Address line 1 is required"),
  line2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  postalCode: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  isDefaultBilling: z.boolean().optional(),
  isDefaultShipping: z.boolean().optional(),
});

export type CustomerAddressFormValues = z.infer<typeof customerAddressSchema>;
