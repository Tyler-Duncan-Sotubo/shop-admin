/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import type {
  BlogPost,
  BlogPostListRow,
  CreateBlogPostPayload,
} from "../types/blog-post.type";

export type GetBlogPostsParams = {
  search?: string;
  status?: "draft" | "published";
  limit?: number;
  offset?: number;
  storeId?: string;
};

export function useCreateBlogPost() {
  const createBlogPost = useCreateMutation<CreateBlogPostPayload>({
    endpoint: `/api/blog-posts`,
    successMessage: "Blog post created successfully",
    refetchKey: "blog-posts",
  });

  return { createBlogPost };
}

export function useGetBlogPosts(
  params: GetBlogPostsParams = {},
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalizedParams: GetBlogPostsParams = {
    search: params.search?.trim() || undefined,
    status: params.status || undefined,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
    storeId: params.storeId || undefined,
  };

  return useQuery({
    queryKey: ["blog-posts", normalizedParams],
    queryFn: async () => {
      const res = await axios.get("/api/blog-posts", {
        params: normalizedParams,
      });
      const payload = res.data.data ?? res.data;

      // expect: { rows: BlogPostListRow[], count: number }
      return {
        rows: (payload.rows ?? []) as BlogPostListRow[],
        count: Number(payload.count ?? 0),
      };
    },
    enabled: hasToken,
  });
}

export function useGetBlogPost(
  id: string,
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  return useQuery({
    queryKey: ["blog-post", id],
    enabled: !!id && hasToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const res = await axios.get(`/api/blog-posts/${id}`);
      return (res.data.data ?? res.data) as BlogPost;
    },
  });
}

/**
 * Update blog post (PATCH)
 * - invalidates blog list + single blog post cache
 * - returns updated BlogPost
 */
export function useUpdateBlogPost(postId: string) {
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["blog-post-update", postId],
    mutationFn: async (payload: CreateBlogPostPayload) => {
      const res = await axios.patch(`/api/blog-posts/${postId}`, payload);
      return (res.data.data ?? res.data) as BlogPost;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["blog-posts"] });
      await qc.invalidateQueries({ queryKey: ["blog-post", postId] });
    },
  });

  /**
   * match your create mutation style: updateBlogPost(payload, setError?)
   */
  const updateBlogPost = async (
    payload: CreateBlogPostPayload,
    setError?: (msg: string) => void
  ) => {
    try {
      setError?.("");
      return await mutation.mutateAsync(payload);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update blog post";
      setError?.(msg);
      return null;
    }
  };

  return {
    updateBlogPost,
    isUpdating: mutation.isPending,
  };
}
