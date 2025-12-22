import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "./use-axios-auth";
import { extractErrorMessage } from "../utils/error-handler";

type RefetchKey =
  | string
  | string[]
  | Array<{
      key: string;
      params?: unknown;
    }>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CreateMutationParams<T> = {
  endpoint: string;
  successMessage?: string;
  refetchKey?: RefetchKey;
  onSuccess?: (created: unknown) => void;
  onError?: (errorMsg: string) => void;
};

/**
 * Reusable mutation hook for creating data via POST request.
 * Handles success, errors, and query refetching.
 */
export function useCreateMutation<T>({
  endpoint,
  successMessage = "Created successfully!",
  refetchKey,
  onSuccess,
  onError,
}: CreateMutationParams<T>) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  /**
   * Executes the mutation.
   * @param data - The data to be sent in the request.
   * @param setError - Function to set error state in the UI.
   * @param resetForm - Optional function to reset a form.
   * @param onClose - Optional function to close a modal.
   */
  const create = async (
    data?: T,
    setError?: (errorMsg: string) => void,
    resetForm?: () => void,
    onClose?: () => void
  ) => {
    try {
      const res = await axiosInstance.post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${session?.backendTokens.accessToken}`,
        },
      });
      if (res.data) {
        toast.success(successMessage || "Creation successful");

        resetForm?.(); // Reset form if provided
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

        onSuccess?.(res.data);

        // **return the created data** for the caller
        return res.data;
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

  return create;
}
