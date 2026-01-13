/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useStores } from "@/features/settings/stores/core/hooks/use-stores";

type StoreScope = {
  activeStoreId: string | null;
  setActiveStoreId: (id: string | null) => void;
};

const StoreScopeContext = createContext<StoreScope | null>(null);

function buildStorageKey(userKey: string) {
  return `activeStoreId:${userKey}`;
}

function getUserKey(session: any) {
  // pick something stable + unique for the user
  // prefer id if you have it, else email
  return session?.user?.id ?? session?.user?.email ?? null;
}

export function StoreScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { stores } = useStores();

  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const lastUserKeyRef = useRef<string | null>(null);

  // Bootstrap active store when login starts / session becomes available
  useEffect(() => {
    if (typeof window === "undefined") return;

    // not logged in yet
    if (status !== "authenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveStoreId(null);
      lastUserKeyRef.current = null;
      return;
    }

    const userKey = getUserKey(session);
    if (!userKey) return;

    // Avoid re-running bootstrap for the same user unless stores changed
    const userChanged = lastUserKeyRef.current !== userKey;
    if (userChanged) {
      lastUserKeyRef.current = userKey;
    }

    const storageKey = buildStorageKey(userKey);
    const stored = window.localStorage.getItem(storageKey);

    // Determine the best initial store id
    const storeIds = new Set(stores.map((s) => s.id));
    const storedIsValid = stored && storeIds.has(stored);

    const nextId = storedIsValid
      ? stored!
      : stores.length > 0
      ? stores[0].id
      : null;

    // Only update if different to avoid loops
    setActiveStoreId((prev) => (prev === nextId ? prev : nextId));
  }, [session, status, stores]);

  // Persist per-user
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "authenticated") return;

    const userKey = getUserKey(session);
    if (!userKey) return;

    const storageKey = buildStorageKey(userKey);

    if (activeStoreId) window.localStorage.setItem(storageKey, activeStoreId);
    else window.localStorage.removeItem(storageKey);
  }, [activeStoreId, session, status]);

  const value = useMemo(
    () => ({ activeStoreId, setActiveStoreId }),
    [activeStoreId]
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
