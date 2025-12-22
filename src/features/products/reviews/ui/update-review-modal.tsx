"use client";

import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  UpdateReviewSchema,
  type UpdateReviewValues,
} from "../schema/review.schema";
import { useUpdateReview } from "../hooks/use-reviews";
import type { Review } from "../types/review.type";

type Props = {
  open: boolean;
  onClose: () => void;
  review: Review | null;
};

export function UpdateReviewModal({ open, onClose, review }: Props) {
  const reviewId = review?.id ?? "";
  const { updateReview } = useUpdateReview(reviewId);

  const form = useForm<UpdateReviewValues>({
    resolver: zodResolver(UpdateReviewSchema),
    values: {
      isApproved: review?.isApproved ?? false,
      rating: review?.rating ?? 5,
      review: review?.review ?? "",
      moderationNote: review?.moderationNote ?? "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const submit = form.handleSubmit(async (values) => {
    if (!review) return;

    await updateReview({
      isApproved: values.isApproved,
      rating: values.rating,
      review: values.review,
      moderationNote: values.moderationNote,
    });

    onClose();
  });

  return (
    <FormModal
      open={open}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      mode="edit"
      title="Moderate review"
      description={
        review
          ? `Review by ${review.authorName} (${review.authorEmail})`
          : "Moderate review"
      }
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      isSubmitting={isSubmitting}
      submitLabel="Save"
      cancelLabel="Back"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isApproved"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <FormLabel>Approved</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (1 - 5)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="review"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="moderationNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moderation note (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Internal note…"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormModal>
  );
}
