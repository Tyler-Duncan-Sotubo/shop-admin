// features/admin-nav/hooks/use-global-search.ts
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useDebounceValue } from "@/shared/hooks/use-debounce";

interface SearchResult {
  id: string;
  number: string;
  customer: string | null;
  status: string;
}

interface SearchResults {
  orders: SearchResult[];
  invoices: SearchResult[];
  quotes: SearchResult[];
}

const EMPTY: SearchResults = { orders: [], invoices: [], quotes: [] };

export function useGlobalSearch() {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounceValue(query, 300);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(EMPTY);
      setIsOpen(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    axios
      .get("/api/search", {
        params: { q: debouncedQuery },
        signal: abortRef.current.signal,
      })
      .then((res) => {
        setResults(res.data.data);
        setIsOpen(true);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  const clear = () => {
    setQuery("");
    setResults(EMPTY);
    setIsOpen(false);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    clear,
    totalResults:
      results.orders.length + results.invoices.length + results.quotes.length,
  };
}
