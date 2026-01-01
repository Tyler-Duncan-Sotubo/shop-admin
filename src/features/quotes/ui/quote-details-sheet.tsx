"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import Loading from "@/shared/ui/loading";
import type { QuoteStatus } from "../types/quote.type";
import { useGetQuote, useUpdateQuoteStatus } from "../hooks/use-quotes";
import { format } from "date-fns";
import { ConvertQuoteToOrderModal } from "./convert-quote-to-order-modal";
import { useConvertQuoteToOrder } from "../hooks/use-convert-quote-to-order";
import { useRouter } from "next/navigation";
import { ConvertQuoteFormValues } from "../schema/convert-quote.schema";

function StatusBadge({ status }: { status: QuoteStatus }) {
  if (status === "new") return <Badge>New</Badge>;
  if (status === "in_progress")
    return <Badge variant="secondary">In progress</Badge>;
  if (status === "converted") return <Badge>Converted</Badge>;
  return <Badge variant="outline">Archived</Badge>;
}

export function QuoteDetailsSheet({ quoteId }: { quoteId: string }) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const router = useRouter();

  const { data, isLoading } = useGetQuote(session, axios, quoteId);
  const updateStatus = useUpdateQuoteStatus(session, axios);

  const convert = useConvertQuoteToOrder(session, axios);

  const [convertOpen, setConvertOpen] = useState(false);

  const quote = data;
  const convertedOrderId = quote?.convertedOrderId ?? null;

  const handleConvert = async (values: ConvertQuoteFormValues) => {
    const res = await convert.mutateAsync({
      quoteId,
      payload: values,
    });

    setConvertOpen(false);

    // Navigate to the created order
    router.push(`/sales/orders/${res.orderId}`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          View
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl p-3 bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span>Quote Request</span>
              {quote ? <StatusBadge status={quote.status} /> : null}
            </div>

            {/* ✅ Create/Open Order button */}
            {convertedOrderId ? (
              <Button
                size="sm"
                onClick={() => router.push(`/sales/orders/${convertedOrderId}`)}
              >
                Open Order
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setConvertOpen(true)}
                disabled={!quote || quote.status === "archived"}
              >
                Create Order
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {/* ✅ Convert modal */}
        <ConvertQuoteToOrderModal
          open={convertOpen}
          quoteId={quoteId}
          onClose={() => setConvertOpen(false)}
          onSubmit={handleConvert}
        />

        {isLoading || !quote ? (
          <div className="py-10">
            <Loading />
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-140px)] pr-4">
            <div className="space-y-6">
              {/* Summary */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="font-medium">{quote.customerEmail}</div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div className="text-sm">
                      {format(new Date(quote.createdAt), "PPp")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Updated</div>
                    <div className="text-sm">
                      {format(new Date(quote.updatedAt), "PPp")}
                    </div>
                  </div>
                </div>

                {quote.customerNote ? (
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground">
                      Customer note
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {quote.customerNote}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Status update */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Update status
                </div>
                {convertedOrderId ? null : (
                  <div className="flex items-center gap-2">
                    <Select
                      value={quote.status}
                      onValueChange={(v) =>
                        updateStatus.mutate({
                          id: quote.id,
                          status: v as QuoteStatus,
                        })
                      }
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    {updateStatus.isPending ? (
                      <span className="text-xs text-muted-foreground">
                        Saving…
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              <Separator />

              {/* Items */}
              <div className="space-y-3">
                <div className="font-medium">
                  Items ({quote.items?.length ?? 0})
                </div>

                <div className="space-y-3">
                  {(quote.items ?? []).map((it) => (
                    <div key={it.id} className="flex gap-3">
                      <div className="h-14 w-14 overflow-hidden shrink-0">
                        {it.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={it.imageUrl}
                            alt={it.nameSnapshot}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1">
                        <div className="font-medium leading-tight">
                          {it.nameSnapshot?.trim()}
                        </div>

                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-sm">
                            Qty:{" "}
                            <span className="font-medium">{it.quantity}</span>
                          </div>

                          {it.attributes ? (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {Object.entries(it.attributes).map(([k, v]) => (
                                <Badge
                                  key={`${k}-${v}`}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {k}: {v}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Convert action hint */}
              {!convertedOrderId ? (
                <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  Tip: Use <span className="font-medium">Create Order</span> to
                  turn this quote into a draft manual/POS order and continue the
                  checkout flow.
                </div>
              ) : null}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
