// features/campaigns/hooks/use-email-sender-config.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance, AxiosError } from "axios";
import type {
  EmailSenderConfig,
  UpsertEmailSenderConfigInput,
} from "../types/email-sender-config.types";

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

export function useGetEmailSenderConfig(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["email-sender-config"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<EmailSenderConfig | null> => {
      const res = await axios.get("/api/email-config");
      return res.data.data ?? null;
    },
  });
}

export function useUpsertEmailSenderConfig(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: UpsertEmailSenderConfigInput,
    ): Promise<EmailSenderConfig> => {
      const res = await axios.put("/api/email-config", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["email-sender-config"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}
