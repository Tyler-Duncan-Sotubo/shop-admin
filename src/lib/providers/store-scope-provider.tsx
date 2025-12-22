"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "activeStoreId";

type StoreScope = {
  activeStoreId: string | null;
  setActiveStoreId: (id: string | null) => void;
};

const StoreScopeContext = createContext<StoreScope | null>(null);

export function StoreScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeStoreId, setActiveStoreId] = useState<string | null>(() => {
    // load from localStorage (client-only)
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  // persist changes
  useEffect(() => {
    if (activeStoreId) {
      window.localStorage.setItem(STORAGE_KEY, activeStoreId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeStoreId]);

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
