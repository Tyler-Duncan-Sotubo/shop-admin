// features/campaigns/hooks/use-campaigns.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance, AxiosError } from "axios";
import type {
  Campaign,
  CreateCampaignInput,
  ListCampaignsParams,
  ListCampaignsResponse,
  UpdateCampaignInput,
} from "../types/campaign.types";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

function getErrorMessage(err: unknown) {
  const e = err as AxiosError<ApiError>;
  return (
    e.response?.data?.error?.message ??
    e.response?.data?.message ??
    e.message ??
    "Something went wrong"
  );
}

export function useGetCampaigns(
  session: Session | null,
  axios: AxiosInstance,
  params: ListCampaignsParams,
) {
  return useQuery({
    queryKey: ["campaigns", params],
    enabled: !!session?.backendTokens?.accessToken && !!params.storeId,
    queryFn: async (): Promise<ListCampaignsResponse> => {
      const res = await axios.get("/api/campaigns", { params });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useGetCampaign(
  session: Session | null,
  axios: AxiosInstance,
  id?: string,
) {
  return useQuery({
    queryKey: ["campaigns", id],
    enabled: !!session?.backendTokens?.accessToken && !!id,
    queryFn: async (): Promise<Campaign> => {
      const res = await axios.get(`/api/campaigns/${id}`);
      return res.data.data;
    },
  });
}

export function useCreateCampaign(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCampaignInput): Promise<Campaign> => {
      const res = await axios.post("/api/campaigns", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useUpdateCampaign(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateCampaignInput): Promise<Campaign> => {
      const { id, ...body } = payload;
      const res = await axios.patch(`/api/campaigns/${id}`, body);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaigns", vars.id] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

// features/campaigns/hooks/use-campaigns.ts
export function useDeleteCampaign(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: true }> => {
      const res = await axios.delete(`/api/campaigns/${id}`);
      return res.data.data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.removeQueries({ queryKey: ["campaigns", id] }); // ← removes the cached campaign immediately
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useScheduleCampaign(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      id: string;
      scheduledAt: string;
    }): Promise<Campaign> => {
      const res = await axios.post(`/api/campaigns/${args.id}/schedule`, {
        scheduledAt: args.scheduledAt,
      });
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaigns", vars.id] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useUnscheduleCampaign(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Campaign> => {
      const res = await axios.post(`/api/campaigns/${id}/unschedule`);
      return res.data.data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaigns", id] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useSendCampaign(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      id: string,
    ): Promise<{ success: boolean; sentCount: number }> => {
      const res = await axios.post(`/api/campaigns/${id}/send`);
      return res.data.data;
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaigns", id] });
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useSendTestCampaign(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useMutation({
    mutationFn: async (args: {
      id: string;
      toEmail: string;
    }): Promise<{ success: boolean; sentTo: string }> => {
      const res = await axios.post(`/api/campaigns/${args.id}/test`, {
        toEmail: args.toEmail,
      });
      return res.data.data;
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useAudienceCount(
  session: Session | null,
  axios: AxiosInstance,
  params: { storeId: string; audienceType: string },
) {
  return useQuery({
    queryKey: ["campaigns", "audience-count", params],
    enabled:
      !!session?.backendTokens?.accessToken &&
      !!params.storeId &&
      !!params.audienceType,
    queryFn: async (): Promise<number> => {
      const res = await axios.get("/api/campaigns/audience/count", { params });
      return res.data.data;
    },
  });
}
