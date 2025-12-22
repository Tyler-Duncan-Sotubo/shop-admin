// src/modules/transfer/ui/update-transfer-status-modal.tsx
"use client";

import { useMemo } from "react";
import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type TransferStatus = "pending" | "in_transit" | "completed" | "cancelled";

type Props = {
  open: boolean;
  onClose: () => void;

  transferId: string;
  currentStatus: TransferStatus;

  fromLocationName?: string | null;
  toLocationName?: string | null;
};

const schema = z.object({
  status: z.enum(["pending", "in_transit", "completed", "cancelled"]),
  notes: z.string().max(255, "Notes must be 255 characters or less").optional(),
});

type Values = z.infer<typeof schema>;

export function UpdateTransferStatusModal({
  open,
  onClose,
  transferId,
  currentStatus,
  fromLocationName,
  toLocationName,
}: Props) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { status: currentStatus, notes: "" },
  });

  const updateTransferStatus = useUpdateMutation({
    endpoint: `/api/inventory/transfers/${transferId}/status`,
    successMessage: "Transfer status updated successfully.",
    refetchKey: "inventory transfers list history",
  });

  const isSubmitting = form.formState.isSubmitting;

  const watchedStatus = useWatch({ control: form.control, name: "status" });

  const description = useMemo(() => {
    if (watchedStatus === "completed") {
      return `Completing will move stock from ${
        fromLocationName ?? "From location"
      } to ${toLocationName ?? "To location"}.`;
    }
    if (watchedStatus === "cancelled") return "Cancelling will NOT move stock.";
    if (watchedStatus === "in_transit")
      return "Mark as in transit (no stock movement yet).";
    return "Set transfer status.";
  }, [watchedStatus, fromLocationName, toLocationName]);

  const submit = form.handleSubmit(async (values) => {
    // body should only contain status + notes
    await updateTransferStatus({
      status: values.status,
      notes: values.notes?.trim() || undefined,
    });

    form.reset({ status: values.status, notes: "" });
    onClose();
  });

  return (
    <FormModal
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          form.reset({ status: currentStatus, notes: "" });
          onClose();
        }
      }}
      mode="edit"
      title="Update transfer status"
      description={description}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      isSubmitting={isSubmitting}
      submitLabel="Update"
      cancelLabel="Back"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as TransferStatus)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_transit">In transit</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Add a note…"
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
