import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { Tax, CreateTaxInput, UpdateTaxInput } from "../types/tax.type";

/* -----------------------------
 * List taxes
 * ------------------------------*/
export function useGetTaxes(
  params: { active?: boolean; storeId?: string | null },
  session: Session | null,
  axios: AxiosInstance
) {
  const storeKey = params.storeId ?? "company-default";
  const activeKey =
    params.active === undefined ? "all" : params.active ? "active" : "inactive";

  return useQuery({
    queryKey: ["billing", "taxes", "list", storeKey, activeKey],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<Tax[]> => {
      const res = await axios.get("/api/taxes", {
        params: {
          storeId: params.storeId ?? null,
          active:
            params.active === undefined ? undefined : String(params.active),
        },
      });
      return res.data.data;
    },
  });
}

/* -----------------------------
 * Create tax
 * ------------------------------*/
export function useCreateTax(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaxInput) => {
      const res = await axios.post("/api/taxes", input);
      return res.data.data as Tax;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "taxes"] });
    },
  });
}

/* -----------------------------
 * Update tax
 * ------------------------------*/
export function useUpdateTax(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { taxId: string; input: UpdateTaxInput }) => {
      const res = await axios.patch(`/api/taxes/${args.taxId}`, args.input);
      return res.data.data as Tax;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "taxes"] });
    },
  });
}

/* -----------------------------
 * Deactivate tax (DELETE)
 * ------------------------------*/
export function useDeactivateTax(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taxId: string) => {
      const res = await axios.delete(`/api/taxes/${taxId}`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "taxes"] });
    },
  });
}

/* -----------------------------
 * Set default tax
 * ------------------------------*/
export function useSetDefaultTax(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (taxId: string) => {
      const res = await axios.post(`/api/taxes/${taxId}/default`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["billing", "taxes"] });
    },
  });
}
