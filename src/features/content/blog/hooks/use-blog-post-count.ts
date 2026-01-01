/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQueries } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";

type BlogStatus = "draft" | "published";

type CountResponse =
  | { data: { count: number } }
  | { count: number }
  | { data: { data: { count: number } } }; // if you nest "data" twice anywhere

async function fetchBlogCount(
  axios: AxiosInstance,
  params: { storeId?: string; search?: string; status?: BlogStatus }
): Promise<number> {
  const qp: Record<string, string | number> = { limit: 1, offset: 0 };
  if (params.search) qp.search = params.search;
  if (params.storeId) qp.storeId = params.storeId;
  if (params.status) qp.status = params.status;

  const res = await axios.get<CountResponse>("/api/blog-posts", { params: qp });

  // handle common shapes: res.data.data.count OR res.data.count
  const payload: any = (res.data as any)?.data ?? res.data;
  return Number(payload?.count ?? payload?.data?.count ?? 0);
}

export function useBlogPostCountsForTabs(
  session: Session | null,
  axios: AxiosInstance,
  args: { storeId?: string; search?: string }
) {
  const storeId = args.storeId || undefined;
  const search = args.search?.trim() || undefined;

  const enabled = !!session?.backendTokens?.accessToken; // add && !!storeId if store required

  const q = useQueries({
    queries: [
      { key: "all", status: undefined },
      { key: "draft", status: "draft" as const },
      { key: "published", status: "published" as const },
    ].map(({ key, status }) => ({
      queryKey: ["blog-posts", "count", key, storeId ?? "all", search ?? ""],
      enabled,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      queryFn: () => fetchBlogCount(axios, { storeId, search, status }),
    })),
  });

  return {
    all: q[0].data ?? 0,
    draft: q[1].data ?? 0,
    published: q[2].data ?? 0,
    isLoading: q.some((x) => x.isLoading),
    isError: q.some((x) => x.isError),
  };
}
