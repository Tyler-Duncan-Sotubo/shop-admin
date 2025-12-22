import { toast } from "sonner";
import useAxiosAuth from "./use-axios-auth";
import { extractErrorMessage } from "../utils/error-handler";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type RefetchKey =
  | string
  | string[]
  | Array<{
      key: string;
      params?: unknown;
    }>;

type DeleteMutationParams = {
  endpoint: string;
  successMessage?: string;
  refetchKey?: RefetchKey;
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
};

/**
 * Reusable mutation hook for deleting data via DELETE request.
 */
export function useDeleteMutation({
  endpoint,
  successMessage = "Deleted successfully!",
  refetchKey,
  onSuccess,
  onError,
}: DeleteMutationParams) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();
  /**
   * Executes the mutation.
   * @param setError - Function to set error state in the UI.
   * @param onClose - Optional function to close a modal.
   */
  const remove = async (
    setError?: (errorMsg: string) => void,
    onClose?: () => void
  ) => {
    try {
      const res = await axiosInstance.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${session?.backendTokens.accessToken}`,
        },
      });

      if (res.status === 200 || res.status === 204) {
        toast.success(successMessage || "Deleted successfully!");

        onClose?.(); // Close modal if provided

        if (refetchKey) {
          if (typeof refetchKey === "string") {
            // backward compatible: "reviews products"
            refetchKey.split(" ").forEach((key) => {
              queryClient.invalidateQueries({ queryKey: [key] });
            });
          } else if (Array.isArray(refetchKey)) {
            refetchKey.forEach((item) => {
              if (typeof item === "string") {
                queryClient.invalidateQueries({ queryKey: [item] });
              } else {
                queryClient.invalidateQueries({
                  queryKey: [item.key, item.params],
                });
              }
            });
          }
        }

        onSuccess?.();
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

      // Display error in UI
      setError?.(errorMessage);

      // Show error toast
      toast.error(errorMessage ?? "An error occurred");

      onError?.(errorMessage);
    }
  };

  return remove;
}
