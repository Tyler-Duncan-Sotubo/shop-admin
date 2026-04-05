"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useStores } from "@/features/settings/stores/core/hooks/use-stores";

type StoreScope = {
  activeStoreId: string | null;
  setActiveStoreId: (id: string | null) => void;
  switching: boolean;
};

const StoreScopeContext = createContext<StoreScope | null>(null);

function buildStorageKey(userKey: string) {
  return `activeStoreId:${userKey}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserKey(session: any) {
  return session?.user?.id ?? session?.user?.email ?? null;
}

export function StoreScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { stores } = useStores();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [activeStoreId, setActiveStoreIdRaw] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const lastUserKeyRef = useRef<string | null>(null);

  // Bootstrap active store when session becomes available or stores change
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (status !== "authenticated") {
      setActiveStoreId(null);
      lastUserKeyRef.current = null;
      return;
    }

    const userKey = getUserKey(session);
    if (!userKey) return;

    const userChanged = lastUserKeyRef.current !== userKey;
    if (userChanged) {
      lastUserKeyRef.current = userKey;
    }

    const storageKey = buildStorageKey(userKey);
    const stored = window.localStorage.getItem(storageKey);
    const storeIds = new Set(stores.map((s) => s.id));
    const storedIsValid = stored && storeIds.has(stored);

    const nextId = storedIsValid
      ? stored!
      : stores.length > 0
        ? stores[0].id
        : null;

    setActiveStoreIdRaw((prev) => (prev === nextId ? prev : nextId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, stores]);

  // Persist active store per user
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "authenticated") return;

    const userKey = getUserKey(session);
    if (!userKey) return;

    const storageKey = buildStorageKey(userKey);

    if (activeStoreId) {
      window.localStorage.setItem(storageKey, activeStoreId);
    } else {
      window.localStorage.removeItem(storageKey);
    }
  }, [activeStoreId, session, status]);

  const setActiveStoreId = useCallback(
    async (id: string | null) => {
      if (id === activeStoreId) return;

      setSwitching(true);
      setActiveStoreIdRaw(id);

      // invalidate all cached queries so everything refetches for new store
      await queryClient.invalidateQueries();

      // refresh server components
      router.refresh();

      setSwitching(false);
    },
    [activeStoreId, queryClient, router],
  );

  const value = useMemo(
    () => ({ activeStoreId, setActiveStoreId, switching }),
    [activeStoreId, setActiveStoreId, switching],
  );

  return (
    <StoreScopeContext.Provider value={value}>
      {children}
    </StoreScopeContext.Provider>
  );
}

export function useStoreScope() {
  const ctx = useContext(StoreScopeContext);
  if (!ctx) {
    throw new Error("useStoreScope must be used within StoreScopeProvider");
  }
  return ctx;
}
