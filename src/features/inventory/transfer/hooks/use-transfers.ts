import { useCreateMutation } from "@/shared/hooks/use-create-mutation";

export type CreateTransferPayload = {
  fromLocationId: string;
  toLocationId: string;
  reference?: string;
  notes?: string;
  items: { productVariantId: string; quantity: number }[];
};

export function useCreateTransfer() {
  const createTransfer = useCreateMutation<CreateTransferPayload>({
    endpoint: "/api/inventory/transfers",
    successMessage: "Transfer created successfully",
    refetchKey: "inventory", // ✅ pick a key that matches your queries
  });

  return { createTransfer };
}
