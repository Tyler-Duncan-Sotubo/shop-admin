import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import type { TransferListItem } from "../types/transfer.type";

export type CreateTransferPayload = {
  fromLocationId: string;
  toLocationId: string;
  reference?: string;
  notes?: string;
  items: { productVariantId: string; quantity: number }[];
};

export type UpdateTransferItemsPayload = {
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

export function useUpdateTransferItems(transferId: string) {
  const updateTransferItems = useUpdateMutation<UpdateTransferItemsPayload>({
    endpoint: `/api/inventory/transfers/${transferId}/items`,
    method: "PATCH",
    successMessage: "Transfer items updated successfully",
    refetchKey: "inventory",
  });

  return { updateTransferItems };
}

export function useGetTransfer(
  transferId: string | null,
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["inventory", "transfers", transferId],
    enabled: !!transferId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<TransferListItem> => {
      const res = await axios.get(`/api/inventory/transfers/${transferId}`);
      return res.data.data;
    },
  });
}
