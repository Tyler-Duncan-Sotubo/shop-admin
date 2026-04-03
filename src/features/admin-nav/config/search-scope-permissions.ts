import type { SearchScope } from "../hooks/use-global-search";

export const SEARCH_SCOPE_PERMISSIONS: Partial<Record<SearchScope, string>> = {
  customers: "customers.read",
  orders: "orders.read",
  invoices: "billing.invoices.read",
  quotes: "quotes.read",
};
