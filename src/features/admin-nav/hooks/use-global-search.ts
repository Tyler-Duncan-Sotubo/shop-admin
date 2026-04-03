/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useDebounceValue } from "@/shared/hooks/use-debounce";

export type SearchScope =
  | "all"
  | "orders"
  | "invoices"
  | "quotes"
  | "customers";

export interface SearchResult {
  id: string;
  number: string | null;
  customer: string | null;
  status: string | null;
  email?: string | null;
}

export interface SearchResults {
  orders: SearchResult[];
  invoices: SearchResult[];
  quotes: SearchResult[];
  customers: SearchResult[];
}

const EMPTY: SearchResults = {
  orders: [],
  invoices: [],
  quotes: [],
  customers: [],
};

export function useGlobalSearch() {
  const axios = useAxiosAuth();

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounceValue(query, 300);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults(EMPTY);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);

    axios
      .get("/api/search", {
        params: {
          q: debouncedQuery.trim(),
          type: scope,
        },
        signal: abortRef.current.signal,
      })
      .then((res) => {
        setResults(res.data.data ?? EMPTY);
        setIsOpen(true);
      })
      .catch((error) => {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          setResults(EMPTY);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      abortRef.current?.abort();
    };
  }, [axios, debouncedQuery, scope]);

  const clear = () => {
    abortRef.current?.abort();
    setQuery("");
    setResults(EMPTY);
    setIsOpen(false);
  };

  const totalResults =
    results.orders.length +
    results.invoices.length +
    results.quotes.length +
    results.customers.length;

  return {
    query,
    setQuery,
    scope,
    setScope,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    clear,
    totalResults,
  };
}
