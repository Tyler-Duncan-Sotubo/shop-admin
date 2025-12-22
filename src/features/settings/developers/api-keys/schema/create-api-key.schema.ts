import z from "zod";

const OriginsSchema = z
  .string()
  .optional()
  .transform((v) =>
    v
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  )
  .refine(
    (origins) =>
      origins.every((o) => {
        try {
          const u = new URL(o);
          return u.protocol === "http:" || u.protocol === "https:";
        } catch {
          return false;
        }
      }),
    "Allowed origins must be full URLs like https://example.com or http://localhost:3000"
  );

export const CreateApiKeySchema = z.object({
  name: z.string().min(2, "Name is required"),
  prefix: z.string().optional(),
  scopes: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  allowedOrigins: OriginsSchema,
  expiresAt: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date"),
});

export type CreateApiKeyValues = z.infer<typeof CreateApiKeySchema>;
