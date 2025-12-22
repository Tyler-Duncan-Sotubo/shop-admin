// features/pickup/hooks/use-pickup-locations.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type {
  PickupLocation,
  CreatePickupLocationInput,
  UpdatePickupLocationInput,
} from "../types/pickup-location.type";

/* -----------------------------
 * List pickup locations (admin)
 * ------------------------------*/
export function useGetPickupLocations(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  return useQuery({
    queryKey: ["pickup", "locations", storeId],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<PickupLocation[]> => {
      const res = await axios.get("/api/pickup/admin", {
        params: { storeId },
      });
      return res.data.data;
    },
  });
}

/* -----------------------------
 * Create pickup location
 * ------------------------------*/
export function useCreatePickupLocation(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePickupLocationInput) => {
      const res = await axios.post("/api/pickup/admin", input);
      return res.data.data as PickupLocation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pickup", "locations"] });
    },
  });
}

/* -----------------------------
 * Update pickup location
 * ------------------------------*/
export function useUpdatePickupLocation(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdatePickupLocationInput;
    }) => {
      const res = await axios.patch(`/api/pickup/admin/${id}`, input);
      return res.data.data as PickupLocation;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pickup", "locations"] });
    },
  });
}

/* -----------------------------
 * Deactivate pickup location
 * ------------------------------*/
export function useDeactivatePickupLocation(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.patch(`/api/pickup-locations/${id}/deactivate`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pickup", "locations"] });
    },
  });
}
