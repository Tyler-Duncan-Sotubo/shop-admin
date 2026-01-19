/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { toast } from "sonner";
import { useUpsertDraftOverride } from "../../core/hooks/use-storefront-overrides";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";
import { StorefrontOverridesV1 } from "../../core/types/storefront.type";

type Patch = Partial<StorefrontOverridesV1> & {
  baseId?: string;
  themeId?: string | null;
};

function deepMerge(a: any, b: any) {
  const out: any = { ...a };
  for (const k of Object.keys(b || {})) {
    const av = out[k];
    const bv = b[k];
    if (
      av &&
      bv &&
      typeof av === "object" &&
      typeof bv === "object" &&
      !Array.isArray(av) &&
      !Array.isArray(bv)
    ) {
      out[k] = deepMerge(av, bv);
    } else {
      out[k] = bv;
    }
  }
  return out;
}

type AutosaveFn = (patch: Patch, opts?: { debounceMs?: number }) => void;

const AutosaveContext = React.createContext<{
  autosave: AutosaveFn;
  flush: (opts?: { toastOnSuccess?: boolean }) => void;
  isSaving: boolean;
  lastSavedAt: number | null;
  error: unknown;
} | null>(null);

export function AutosaveProvider({
  session,
  axios,
  storeId,
  children,
  defaultDebounceMs = 600,
}: {
  session: Session | null;
  axios: AxiosInstance;
  storeId: string;
  children: React.ReactNode;
  defaultDebounceMs?: number;
}) {
  const upsert = useUpsertDraftOverride(session, axios, storeId);

  const bufferRef = React.useRef<Patch>({});
  const [delay, setDelay] = React.useState<number>(defaultDebounceMs);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);

  // throttle error toasts so they don't spam on flaky networks
  const lastErrorToastAtRef = React.useRef<number>(0);

  const commit = React.useCallback(
    (opts?: { toastOnSuccess?: boolean }) => {
      const payload = bufferRef.current;
      if (!payload || Object.keys(payload).length === 0) return;

      bufferRef.current = {};

      upsert.mutate(payload, {
        onSuccess: () => {
          setLastSavedAt(Date.now());
          if (opts?.toastOnSuccess) toast.success("Saved");
        },
        onError: (err: any) => {
          const now = Date.now();
          if (now - lastErrorToastAtRef.current < 2500) return;
          lastErrorToastAtRef.current = now;

          toast.error("Couldn’t save changes", {
            description: err?.message ?? "Please try again.",
          });
        },
      });
    },
    [upsert]
  );

  // debounced commit
  const { debounced, cancel } = useDebounceCallback(() => commit(), delay);

  const autosave: AutosaveFn = React.useCallback(
    (patch, opts) => {
      bufferRef.current = deepMerge(bufferRef.current, patch);
      setDelay(opts?.debounceMs ?? defaultDebounceMs);

      cancel();
      debounced();
    },
    [cancel, debounced, defaultDebounceMs]
  );

  const flush = React.useCallback(
    (opts?: { toastOnSuccess?: boolean }) => {
      cancel();
      commit({ toastOnSuccess: opts?.toastOnSuccess ?? true });
    },
    [cancel, commit]
  );

  return (
    <AutosaveContext.Provider
      value={{
        autosave,
        flush,
        isSaving: upsert.isPending,
        lastSavedAt,
        error: upsert.error,
      }}
    >
      {children}
    </AutosaveContext.Provider>
  );
}

export function useAutosaveDraft() {
  const ctx = React.useContext(AutosaveContext);
  if (!ctx)
    throw new Error("useAutosaveDraft must be used within AutosaveProvider");
  return ctx;
}
