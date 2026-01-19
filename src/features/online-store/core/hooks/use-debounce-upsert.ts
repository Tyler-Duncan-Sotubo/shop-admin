/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { StorefrontOverridesV1 } from "../types/storefront.type";
import { useUpsertDraftOverride } from "./use-storefront-overrides"; // <-- adjust path to your file
import { useDebounceCallback } from "@/shared/hooks/use-debounce";

type Patch = Partial<StorefrontOverridesV1> & {
  baseId?: string;
  themeId?: string | null;
};

// small merge that works for your nested config patches
function deepMerge<T extends Record<string, any>>(a: T, b: T): T {
  const out: any = { ...(a as any) };
  for (const key of Object.keys(b)) {
    const av = (out as any)[key];
    const bv = (b as any)[key];

    if (
      av &&
      bv &&
      typeof av === "object" &&
      typeof bv === "object" &&
      !Array.isArray(av) &&
      !Array.isArray(bv)
    ) {
      (out as any)[key] = deepMerge(av, bv);
    } else {
      (out as any)[key] = bv;
    }
  }
  return out;
}

/**
 * Debounced autosave for "small changes" like toggles / selects.
 * - Coalesces multiple patches into one request
 * - Uses your existing react-query mutation + invalidations
 */
export function useDebouncedUpsertDraftOverride(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string,
  delayMs = 500
) {
  const upsert = useUpsertDraftOverride(session, axios, storeId);

  // collects patches while debounce timer is running
  const bufferRef = React.useRef<Patch>({});

  const commit = React.useCallback(() => {
    const payload = bufferRef.current;
    const hasKeys = payload && Object.keys(payload).length > 0;
    if (!hasKeys) return;

    bufferRef.current = {};
    upsert.mutate(payload);
  }, [upsert]);

  const { debounced, cancel } = useDebounceCallback(commit, delayMs);

  const queue = React.useCallback(
    (patch: Patch) => {
      bufferRef.current = deepMerge(bufferRef.current as any, patch as any);
      debounced();
    },
    [debounced]
  );

  const flush = React.useCallback(() => {
    cancel();
    commit();
  }, [cancel, commit]);

  return {
    queue, // debounced autosave
    flush, // force save now (optional)
    cancel,
    isSaving: upsert.isPending,
    error: upsert.error,
  };
}
