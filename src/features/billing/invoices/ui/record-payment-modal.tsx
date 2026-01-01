// src/modules/billing/invoice/ui/record-payment-modal.tsx
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
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
import { useRecordInvoicePayment } from "../hooks/use-invoices";
import { PaymentMethod } from "../types/invoice.type";
import { ImageDropzone } from "@/shared/ui/image-dropzone";
import {
  recordPaymentSchema,
  RecordPaymentValues,
} from "../schema/record-payment.schema";

type Props = {
  open: boolean;
  onClose: () => void;

  invoiceId: string;
  currency: string;

  defaultAmountMinor?: number;
};

export function RecordPaymentModal({
  open,
  onClose,
  invoiceId,
  currency,
  defaultAmountMinor,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultAmountMajor =
    typeof defaultAmountMinor === "number"
      ? Number((defaultAmountMinor / 100).toFixed(2))
      : 0;

  const form = useForm<RecordPaymentValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      method: "bank_transfer",
      amount: defaultAmountMajor,
      currency,
      reference: "",
      evidenceDataUrl: null,
      evidenceFileName: null,
      evidenceNote: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const recordPayment = useRecordInvoicePayment(
    invoiceId,
    form,
    setSubmitError,
    onClose
  );

  const description = useMemo(() => {
    return "Record a payment against this invoice. Partial payments are supported. You can also attach evidence (receipt screenshot or PDF).";
  }, []);

  const submit = form.handleSubmit(async (values) => {
    // recordPayment is the function returned by useCreateMutation(...)
    await recordPayment({
      amount: Number(values.amount), // MAJOR
      currency: values.currency,
      method: values.method as PaymentMethod,
      reference: values.reference?.trim() || undefined,

      evidenceDataUrl: values.evidenceDataUrl || undefined,
      evidenceFileName: values.evidenceFileName || undefined,
      evidenceNote: values.evidenceNote?.trim() || undefined,
    });
  });

  return (
    <FormModal
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          form.reset({
            method: "bank_transfer",
            amount: defaultAmountMajor,
            currency,
            reference: "",
            evidenceDataUrl: null,
            evidenceFileName: null,
            evidenceNote: "",
          });
          onClose();
        }
      }}
      mode="edit"
      title="Record payment"
      description={description}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      isSubmitting={isSubmitting}
      submitLabel="Record"
      cancelLabel="Back"
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as PaymentMethod)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        Bank transfer
                      </SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card_manual">Card (manual)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="e.g. 50.00"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Transfer ref / POS ref"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Evidence upload */}
          <FormField
            control={form.control}
            name="evidenceDataUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageDropzone
                    value={(field.value as string | null) ?? null}
                    disabled={isSubmitting}
                    onChange={(dataUrl, info) => {
                      field.onChange(dataUrl);
                      form.setValue(
                        "evidenceFileName",
                        info?.fileName ?? null,
                        {
                          shouldDirty: true,
                        }
                      );
                    }}
                    accept={{ "image/*": [], "application/pdf": [] }}
                    helperText="Optional. Upload receipt screenshot or bank slip PDF."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="evidenceNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evidence note (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g. Screenshot from customer, bank confirmation, teller name…"
                    disabled={isSubmitting}
                    className="min-h-20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError ? (
            <div className="text-sm text-red-600">{submitError}</div>
          ) : null}
        </div>
      </Form>
    </FormModal>
  );
}
