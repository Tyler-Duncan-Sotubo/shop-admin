"use client";

import { useEffect, useState } from "react";

export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota / private mode
    }
  }, [key, state]);

  return [state, setState];
}
