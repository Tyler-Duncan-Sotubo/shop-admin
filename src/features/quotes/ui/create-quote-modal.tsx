"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/shared/ui/form";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useCreateQuote } from "@/features/quotes/hooks/use-quotes";
import {
  CreateQuoteFormValues,
  createQuoteSchema,
} from "../schema/quote.schema";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateQuoteModal({ open, onClose }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const form = useForm<CreateQuoteFormValues>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      storeId: activeStoreId ?? "",
      customerEmail: "",
      customerNote: "",
    },
  });

  const createQuote = useCreateQuote(session, axios);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await createQuote.mutateAsync({
        ...values,
        storeId: activeStoreId ?? values.storeId,
        meta: {
          isAdmin: true,
        },
        items: [], // Items are added on the next page
      });

      onClose();
      router.push(`/sales/rfqs/${created.id}`);
    } catch (error) {
      onClose();
      toast.error("Failed to create quote. Please try again.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  });

  return (
    <FormModal
      open={open}
      onClose={onClose}
      mode="create"
      title="Create quote"
      description="Create a quote draft and add items on the next page."
      onSubmit={onSubmit}
      isSubmitting={createQuote.isPending}
      submitLabel="Create quote"
    >
      <Form {...form}>
        {/* Email */}
        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="customer@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="customerNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer note</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional note"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </FormModal>
  );
}
