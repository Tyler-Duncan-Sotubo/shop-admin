"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Badge } from "@/shared/ui/badge";
import { IoIosCloseCircle } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";

// Option type for MultiSelect
export type Option = { label: string; value: string };

// Debounce hook
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// ---- Minimal Product type for search results ----
type ProductSearchRow = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

// ---- Helper MultiSelect UI (same style as your example) ----
type MultiSelectProps = {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  onSearch: (query: string) => void;
  loading: boolean;
  placeholder?: string;
};

function MultiSelect({
  options,
  selected,
  onChange,
  onSearch,
  loading,
  placeholder = "Search products...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    onSearch(inputValue);
  }, [inputValue, onSearch]);

  const selectables = React.useMemo(
    () =>
      options.filter((opt) => !selected.some((sel) => sel.value === opt.value)),
    [options, selected]
  );

  const handleUnselect = (value: string) =>
    onChange(selected.filter((v) => v.value !== value));

  return (
    <Command className="overflow-visible bg-transparent">
      <div
        className="group border border-input px-3 py-2 text-sm rounded-md
                   focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((opt) => (
            <Badge key={opt.value} variant="completed">
              {opt.label}
              <button
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleUnselect(opt.value)}
                type="button"
              >
                <IoIosCloseCircle className="h-5 w-5 text-monzo-secondary hover:text-monzo-error" />
              </button>
            </Badge>
          ))}

          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 w-full"
          />
        </div>
      </div>

      <div className="relative mt-2">
        {open && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md animate-in">
            <CommandList>
              {loading ? (
                <div className="px-4 py-2 text-muted-foreground">
                  Loading...
                </div>
              ) : selectables.length > 0 ? (
                <CommandGroup className="max-h-64 overflow-auto">
                  {selectables.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={() => {
                        onChange([...selected, opt]);
                        setInputValue("");
                      }}
                    >
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  );
}

type ProductMultiSelectProps = {
  name: string; // e.g. "linked.related"
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;

  /**
   * Endpoint that returns products by ?search=
   * Example: "/api/catalog/products" or "/api/products"
   * Must return { data: ProductSearchRow[] } OR ProductSearchRow[]
   */
  searchEndpoint?: string;
};

export function ProductMultiSelect({
  name,
  label,
  description,
  placeholder,
  className,
  searchEndpoint = "/api/catalog/products", // <-- change anytime
}: ProductMultiSelectProps) {
  const { control } = useFormContext();
  const watched = useWatch({ control, name }) as string[] | undefined;

  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  // Label builder
  const buildLabel = React.useCallback((p: ProductSearchRow) => {
    const n = (p.name ?? "").trim();
    const s = (p.slug ?? "").trim();
    if (n && s) return `${n} (${s})`;
    // eslint-disable-next-line react-hooks/immutability
    return n || s || shortId(p.id);
  }, []);

  // Fetch products by search query
  const { data: productRows = [], isLoading } = useQuery({
    queryKey: ["products-search", searchEndpoint, debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(searchEndpoint, {
        params: { search: debouncedSearch, limit: 20 },
      });
      return (res.data?.data ?? res.data ?? []) as ProductSearchRow[];
    },
    enabled: !!session?.backendTokens?.accessToken,
    staleTime: 0,
  });

  const apiOptions: Option[] = React.useMemo(
    () =>
      productRows.map((p) => ({
        value: p.id,
        label: buildLabel(p),
      })),
    [productRows, buildLabel]
  );

  // Cache labels for preselected ids
  const labelCacheRef = React.useRef<Map<string, string>>(new Map());
  React.useEffect(() => {
    if (!apiOptions.length) return;
    const cache = labelCacheRef.current;
    for (const o of apiOptions) cache.set(o.value, o.label);
  }, [apiOptions]);

  const optionMap = React.useMemo(
    () => new Map(apiOptions.map((o) => [o.value, o] as const)),
    [apiOptions]
  );

  function shortId(id: string) {
    return id?.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;
  }

  const idsToOptions = React.useCallback(
    (ids: string[] = []): Option[] =>
      ids.map((id) => {
        const hit = optionMap.get(id);
        if (hit) return hit;
        const cached = labelCacheRef.current.get(id);
        return { value: id, label: cached ?? "Loading…" };
      }),
    [optionMap]
  );

  const selectedOptions = React.useMemo(() => {
    const ids = Array.isArray(watched) ? watched : [];
    return idsToOptions(ids);
  }, [watched, idsToOptions]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={className}>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <MultiSelect
                options={apiOptions}
                selected={selectedOptions}
                onChange={(opts) => {
                  // warm cache
                  const cache = labelCacheRef.current;
                  for (const o of opts) cache.set(o.value, o.label);

                  field.onChange(opts.map((o) => o.value)); // store string[]
                }}
                onSearch={setSearch}
                loading={isLoading}
                placeholder={placeholder}
              />
            </FormControl>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
