// features/admin-nav/ui/global-search.tsx
"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ChevronRight } from "lucide-react";
import { useGlobalSearch, type SearchScope } from "../hooks/use-global-search";
import { useOnClickOutside } from "@/shared/hooks/use-on-click-outside";
import { QUICK_FILTERS } from "../config/quick-filters";

const SECTION_META = {
  orders: {
    label: "Orders",
    href: (id: string) => `/sales/orders/${id}`,
    listHref: "/sales/orders",
  },
  invoices: {
    label: "Invoices",
    href: (id: string) => `/sales/invoices/${id}`,
    listHref: "/sales/invoices",
  },
  quotes: {
    label: "Quotes",
    href: (id: string) => `/sales/rfqs/${id}`,
    listHref: "/sales/rfqs",
  },
  customers: {
    label: "Customers",
    href: (id: string) => `/customers/${id}`,
    listHref: "/customers",
  },
} as const;

type Section = keyof typeof SECTION_META;

const SEARCH_SCOPES: { value: SearchScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "customers", label: "Customers" },
  { value: "orders", label: "Orders" },
  { value: "invoices", label: "Invoices" },
  { value: "quotes", label: "Quotes" },
];

const SECTIONS: Section[] = ["orders", "invoices", "quotes", "customers"];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  paid: "bg-green-100 text-green-700",
  fulfilled: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
  on_hold: "bg-yellow-100 text-yellow-700",
  issued: "bg-green-100 text-green-700",
  new: "bg-purple-100 text-purple-700",
  accepted: "bg-blue-100 text-blue-700",
  converted: "bg-indigo-100 text-indigo-700",
  lay_buy: "bg-orange-100 text-orange-700",
  overdue: "bg-red-100 text-red-700",
};

export function GlobalSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement>;
  const inputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useGlobalSearch();

  useOnClickOutside(containerRef, () => setIsOpen(false));

  const showQuickFilters = isOpen && !query.trim();
  const showResults = isOpen && !!query.trim() && totalResults > 0;
  const showNoResults =
    isOpen && !!query.trim() && !isLoading && totalResults === 0;

  const activeSections = scope === "all" ? SECTIONS : ([scope] as Section[]);

  const placeholder =
    scope === "all"
      ? "Search customers, orders, invoices, quotes..."
      : `Search ${SEARCH_SCOPES.find((s) => s.value === scope)?.label.toLowerCase()}...`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Enter" && query.trim()) {
      if (scope !== "all") {
        const meta = SECTION_META[scope as Section];
        router.push(
          `${meta.listHref}?search=${encodeURIComponent(query.trim())}`,
        );
        clear();
        return;
      }

      const topSection = SECTIONS.reduce(
        (best, section) =>
          results[section].length >= results[best].length ? section : best,
        "orders" as Section,
      );

      router.push(
        `${SECTION_META[topSection].listHref}?search=${encodeURIComponent(query.trim())}`,
      );
      clear();
    }
  };

  return (
    <div ref={containerRef} className="relative w-140">
      {/* Input */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
        {isLoading ? (
          <Loader2 size={14} className="text-gray-400 animate-spin shrink-0" />
        ) : (
          <Search size={14} className="text-gray-400 shrink-0" />
        )}

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />

        {query && (
          <button onClick={clear} type="button">
            <X size={13} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-lg border shadow-lg z-50 overflow-hidden">
          {/* Scope filters */}
          <div className="px-3 py-2 border-b bg-white">
            <div className="flex flex-wrap gap-1.5">
              {SEARCH_SCOPES.map((item) => {
                const active = scope === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setScope(item.value);
                      setIsOpen(true);
                      inputRef.current?.focus();
                    }}
                    className={[
                      "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick filters */}
          {showQuickFilters && (
            <>
              <div className="px-3 py-2 border-b">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  Quick Filters
                </span>
              </div>

              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.href}
                  onClick={() => {
                    router.push(filter.href);
                    clear();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{filter.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {filter.label}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {filter.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-gray-500 shrink-0 ml-2 transition-colors"
                  />
                </button>
              ))}
            </>
          )}

          {/* Results */}
          {showResults && (
            <>
              {activeSections.map((section) => {
                const rows = results[section];
                if (!rows.length) return null;

                const meta = SECTION_META[section];

                return (
                  <div key={section}>
                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        {meta.label}
                      </span>

                      <button
                        onClick={() => {
                          router.push(
                            `${meta.listHref}?search=${encodeURIComponent(query.trim())}`,
                          );
                          clear();
                        }}
                        className="flex items-center gap-0.5 text-[11px] text-primary hover:underline"
                      >
                        See all
                        <ChevronRight size={11} />
                      </button>
                    </div>

                    {rows.map((row) => {
                      const title =
                        section === "customers"
                          ? row.customer || row.email || "Unnamed customer"
                          : row.number || "Untitled";

                      const subtitle =
                        section === "customers"
                          ? row.email || null
                          : row.customer || null;

                      return (
                        <button
                          key={row.id}
                          onClick={() => {
                            router.push(meta.href(row.id));
                            clear();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {title}
                            </p>

                            {subtitle && (
                              <p className="text-xs text-gray-400 truncate">
                                {subtitle}
                              </p>
                            )}
                          </div>

                          {row.status ? (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-2 shrink-0 capitalize ${
                                STATUS_COLORS[row.status] ??
                                "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {row.status.replace(/_/g, " ")}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}

          {/* No results */}
          {showNoResults && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-gray-500">
                No results for{" "}
                <span className="font-medium">&quot;{query}&quot;</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try a customer name, email, order number, invoice number or
                quote number
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
