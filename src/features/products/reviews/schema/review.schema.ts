import { z } from "zod";

export const UpdateReviewSchema = z.object({
  isApproved: z.boolean(),
  rating: z.transform(Number).pipe(z.number()),
  review: z.string(),
  moderationNote: z.string(),
});

export type UpdateReviewValues = z.infer<typeof UpdateReviewSchema>;
