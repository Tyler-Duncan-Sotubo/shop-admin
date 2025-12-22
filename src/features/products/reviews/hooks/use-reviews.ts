"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import type {
  Review,
  ReviewQuery,
  UpdateReviewPayload,
} from "../types/review.type";
import { AxiosInstance } from "axios";

export type ReviewsResponse = {
  items: Review[];
  total: number;
  limit: number;
  offset: number;
};

export function useGetReviews(
  params: ReviewQuery = {},
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  // convert boolean -> "true"/"false" for backend DTO
  const apiParams = {
    ...params,
    search: params.search?.trim() || undefined,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
    isApproved:
      typeof params.isApproved === "boolean"
        ? params.isApproved
          ? "true"
          : "false"
        : undefined,
  };

  return useQuery({
    queryKey: ["reviews", apiParams],
    queryFn: async () => {
      const res = await axios.get("/api/catalog/reviews", {
        params: apiParams,
      });
      const raw = res.data.data ?? res.data;

      // ✅ normalize
      if (Array.isArray(raw)) {
        return {
          items: raw as Review[],
          total: raw.length,
          limit: apiParams.limit,
          offset: apiParams.offset,
        } satisfies ReviewsResponse;
      }

      return raw as ReviewsResponse; // expects { items, total, limit, offset }
    },
    enabled: hasToken,
    staleTime: 10_000,
  });
}

export function useUpdateReview(reviewId: string) {
  const update = useUpdateMutation<UpdateReviewPayload>({
    endpoint: `/api/catalog/reviews/${reviewId}`,
    successMessage: "Review updated successfully.",
    refetchKey: ["reviews", "reviews-count"],
  });

  return { updateReview: update };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTotal(axios: AxiosInstance, params: Record<string, any>) {
  const res = await axios.get("/api/catalog/reviews", { params });
  const data = res.data.data ?? res.data;
  return Number(data.total ?? 0);
}

export function useReviewCounts(
  search: string | undefined,
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const base = {
    limit: 1,
    offset: 0,
    search,
  };

  const all = useQuery({
    queryKey: ["reviews-count", "all", base],
    queryFn: () => fetchTotal(axios, base),
    enabled: hasToken,
    staleTime: 10_000,
  });

  const approved = useQuery({
    queryKey: ["reviews-count", "approved", base],
    queryFn: () => fetchTotal(axios, { ...base, isApproved: "true" }),
    enabled: hasToken,
    staleTime: 10_000,
  });

  const pending = useQuery({
    queryKey: ["reviews-count", "pending", base],
    queryFn: () => fetchTotal(axios, { ...base, isApproved: "false" }),
    enabled: hasToken,
    staleTime: 10_000,
  });

  return {
    all: all.data ?? 0,
    approved: approved.data ?? 0,
    pending: pending.data ?? 0,
    isLoading: all.isLoading || approved.isLoading || pending.isLoading,
  };
}
