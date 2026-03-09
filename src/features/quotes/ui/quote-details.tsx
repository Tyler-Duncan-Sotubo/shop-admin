/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SiZoho } from "react-icons/si";

import type { QuoteStatus } from "../types/quote.type";
import {
  useGetQuote,
  useRemoveQuoteItems,
  useUpdateQuoteItems,
  useUpdateQuoteStatus,
} from "../hooks/use-quotes";
import { useConvertQuoteToOrder } from "../hooks/use-convert-quote-to-order";
import { useSendQuoteToZoho } from "../hooks/use-send-quote-to-zoho";
import { ConvertQuoteToOrderModal } from "./convert-quote-to-order-modal";
import { QuoteItemsCard } from "./quote-items-card";
import { AddQuoteItemsModal } from "./add-quote-items";
import { RefreshCcw } from "lucide-react";

function StatusBadge({ status }: { status: QuoteStatus }) {
  if (status === "new") return <Badge>New</Badge>;
  if (status === "in_progress")
    return <Badge variant="secondary">In progress</Badge>;
  if (status === "converted") return <Badge>Converted</Badge>;
  return <Badge variant="outline">Archived</Badge>;
}

export default function QuoteDetailsClient({ quoteId }: { quoteId: string }) {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const router = useRouter();

  const { data, isLoading } = useGetQuote(session, axios, quoteId);
  const updateStatus = useUpdateQuoteStatus(session, axios);
  const convert = useConvertQuoteToOrder(session, axios);
  const sendToZoho = useSendQuoteToZoho(session, axios);
  const updateItems = useUpdateQuoteItems(session, axios);
  const removeItems = useRemoveQuoteItems(session, axios);

  const [convertOpen, setConvertOpen] = useState(false);
  const [addItemsOpen, setAddItemsOpen] = useState(false);

  if (authStatus === "loading" || isLoading) return <Loading />;
  if (!data) return null;

  const quote = data;
  const convertedOrderId = quote?.convertedOrderId ?? null;

  const handleConvert = async (values: any) => {
    const res = await convert.mutateAsync({
      quoteId,
      payload: values,
    });

    setConvertOpen(false);
    router.push(`/sales/orders/${res.orderId}`);
  };

  const handleSendToZoho = async () => {
    try {
      await sendToZoho.mutateAsync({ quoteId });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Quote ${quote.quoteNumber ?? quote.id.slice(0, 8)}`}
        description="Quote request details and actions."
      >
        {convertedOrderId ? (
          <Button
            onClick={() => router.push(`/sales/orders/${convertedOrderId}`)}
          >
            Open Order
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="clean" onClick={() => setAddItemsOpen(true)}>
              Add Item
            </Button>
            <Button
              variant="secondary"
              onClick={handleSendToZoho}
              disabled={quote.status === "archived" || sendToZoho.isPending}
              className="flex items-center gap-2"
            >
              {!quote.zohoEstimateId ? (
                <div className="flex items-center gap-2">
                  <SiZoho className="text-green-500" />
                  {sendToZoho.isPending ? "Sending…" : "Send to Zoho"}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCcw
                    className={sendToZoho.isPending ? "animate-spin" : ""}
                  />
                  {sendToZoho.isPending ? "Syncing…" : "Sync to Zoho"}
                </div>
              )}
            </Button>

            <Button
              onClick={() => setConvertOpen(true)}
              disabled={quote.status === "archived"}
            >
              Create Order
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_450px]">
        {/* LEFT */}
        <div className="">
          <div className="rounded-lg border p-4 space-y-7">
            <div className="flex flex-row items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold">Quote summary</p>
                <p className="text-xs">
                  {quote.zohoEstimateNumber
                    ? `Zoho Estimate #${quote.zohoEstimateNumber}`
                    : "Not sent to Zoho"}
                </p>
              </div>
              <StatusBadge status={quote.status} />
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground">Customer</div>
                <div className="text-sm">{quote.customerEmail}</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="text-sm">
                    {format(new Date(quote.createdAt), "PPp")}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                  <div className="text-sm">
                    {format(new Date(quote.updatedAt), "PPp")}
                  </div>
                </div>
              </div>

              {quote.customerNote ? (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Customer note
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {quote.customerNote}
                    </div>
                  </div>
                </>
              ) : null}

              {!convertedOrderId && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Update status
                    </div>

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
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Items */}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <QuoteItemsCard
            currency="NGN"
            items={quote?.items ?? []}
            isUpdating={updateItems.isPending || removeItems.isPending}
            onChangeQuantity={(itemId, quantity) => {
              updateItems.mutate({
                quoteId,
                items: [{ itemId, quantity }],
              });
            }}
            onRemoveItem={(itemId) => {
              removeItems.mutate({
                quoteId,
                itemIds: [itemId],
              });
            }}
          />
        </div>
      </div>

      <ConvertQuoteToOrderModal
        open={convertOpen}
        quoteId={quoteId}
        onClose={() => setConvertOpen(false)}
        onSubmit={handleConvert}
      />

      <AddQuoteItemsModal
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
        quoteId={quoteId}
      />
    </section>
  );
}
