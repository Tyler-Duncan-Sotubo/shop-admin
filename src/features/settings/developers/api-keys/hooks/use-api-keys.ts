import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import type {
  ApiKeyRow,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
  RevokeApiKeyResponse,
} from "../types/api-keys.type";

export function useGetApiKeys(session: Session | null, axios: AxiosInstance) {
  return useQuery({
    queryKey: ["apiKeys", "list"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ApiKeyRow[]> => {
      const res = await axios.get(`/api/api-keys`);
      return res.data.data as ApiKeyRow[];
    },
  });
}

export function useCreateApiKey(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateApiKeyPayload
    ): Promise<CreateApiKeyResponse> => {
      const res = await axios.post(`/api/api-keys`, payload);
      return res.data.data as CreateApiKeyResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apiKeys", "list"] });
    },
  });
}

export function useRevokeApiKey(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<RevokeApiKeyResponse> => {
      const res = await axios.patch(`/api/api-keys/${id}/revoke`);
      return res.data.data as RevokeApiKeyResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apiKeys", "list"] });
    },
  });
}
