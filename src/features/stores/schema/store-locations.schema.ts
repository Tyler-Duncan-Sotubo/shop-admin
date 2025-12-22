import z from "zod";

export const StoreLocationsSchema = z.object({
  locationIds: z
    .array(z.string())
    .min(1, "Select at least one inventory location"),
});

export type StoreLocationsFormValues = z.infer<typeof StoreLocationsSchema>;
