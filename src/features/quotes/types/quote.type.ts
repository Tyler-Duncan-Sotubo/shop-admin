// features/quotes/types/quote.type.ts
export type QuoteStatus =
  | "new"
  | "in_progress"
  | "converted"
  | "archived"
  | "all";

export type QuoteItem = {
  id: string;
  quoteRequestId: string;
  productId: string | null;
  variantId: string | null;

  nameSnapshot: string;
  variantSnapshot: string | null;
  attributes: Record<string, string> | null;

  imageUrl: string | null;
  quantity: number;
  position: number;

  createdAt: string;
  deletedAt: string | null;
};

export type Quote = {
  id: string;
  companyId: string;
  storeId: string;

  status: QuoteStatus;
  customerEmail: string;
  customerNote: string | null;

  meta: unknown | null;

  expiresAt: string | null;
  archivedAt: string | null;

  convertedInvoiceId: string | null;
  convertedOrderId: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type QuoteWithItems = Quote & { items: QuoteItem[] };

// features/quotes/types/quote.type.ts
export type ListQuotesParams = {
  storeId: string; // REQUIRED by backend DTO
  search?: string;
  status?: QuoteStatus;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
};
