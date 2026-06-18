// features/subscriptions/hooks/use-subscriptions.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance, AxiosError } from "axios";
import type {
  CompanySubscription,
  CreditBundle,
  CreditTopupRequest,
  InitiateTopupResponse,
  SubscriptionInvoice,
  SubscriptionPlan,
} from "../types/subscriptions.types";

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

// ── Plans ─────────────────────────────────────────────────────
export function useGetPlans(session: Session | null, axios: AxiosInstance) {
  return useQuery({
    queryKey: ["subscriptions", "plans"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const res = await axios.get("/api/subscriptions/plans");
      return res.data.data;
    },
  });
}

// ── Current subscription ──────────────────────────────────────
export function useGetMySubscription(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["subscriptions", "me"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<CompanySubscription | null> => {
      const res = await axios.get("/api/subscriptions/me");
      return res.data.data ?? null;
    },
  });
}

// ── Cancel subscription ───────────────────────────────────────
export function useCancelSubscription(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (reason?: string): Promise<void> => {
      await axios.post("/api/subscriptions/cancel", { reason });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

// features/subscriptions/hooks/use-subscriptions.ts — add
export type BillingSummary = {
  subscription: CompanySubscription | null;
  plans: SubscriptionPlan[];
  topups: CreditTopupRequest[];
  invoices: SubscriptionInvoice[];
};

export function useGetBillingSummary(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["subscriptions", "billing-summary"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<BillingSummary> => {
      const res = await axios.get("/api/subscriptions/billing-summary");
      return res.data.data;
    },
  });
}

// ── Initiate plan subscription ────────────────────────────────
export function useInitiateSubscription(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useMutation({
    mutationFn: async (payload: {
      planId: string;
      billingCycle: "monthly" | "annual";
    }): Promise<{
      reference: string;
      authorizationUrl: string;
      accessCode: string;
      planName: string;
      amountNGN: number;
      billingCycle: string;
    }> => {
      const res = await axios.post("/api/subscriptions/initiate", payload);
      return res.data.data;
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

// ── Invoices ──────────────────────────────────────────────────
export function useGetInvoices(session: Session | null, axios: AxiosInstance) {
  return useQuery({
    queryKey: ["subscriptions", "invoices"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<SubscriptionInvoice[]> => {
      const res = await axios.get("/api/subscriptions/invoices");
      return res.data.data;
    },
  });
}

// ── Credit bundles ────────────────────────────────────────────
export function useGetCreditBundles(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["subscriptions", "credits", "bundles"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<CreditBundle[]> => {
      const res = await axios.get("/api/subscriptions/credits/bundles");
      return res.data.data;
    },
  });
}

// ── Initiate credit topup ─────────────────────────────────────
export function useInitiateTopup(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useMutation({
    mutationFn: async (credits: number): Promise<InitiateTopupResponse> => {
      const res = await axios.post("/api/subscriptions/credits/initiate", {
        credits,
      });
      return res.data.data;
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

// ── Verify topup ──────────────────────────────────────────────
export function useVerifyTopup(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string): Promise<void> => {
      await axios.post("/api/subscriptions/credits/verify", { reference });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credits"] });
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

// ── Topup history ─────────────────────────────────────────────
export function useGetTopupHistory(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["subscriptions", "credits", "history"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<CreditTopupRequest[]> => {
      const res = await axios.get("/api/subscriptions/credits/history");
      return res.data.data;
    },
  });
}

// features/subscriptions/hooks/use-subscriptions.ts — add
export function useVerifySubscription(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string): Promise<void> => {
      await axios.post("/api/subscriptions/verify", { reference });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useRenewSubscription(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useMutation({
    mutationFn: async (): Promise<{
      authorizationUrl: string;
      reference: string;
    }> => {
      const res = await axios.post("/api/subscriptions/renew");
      return res.data.data;
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}
