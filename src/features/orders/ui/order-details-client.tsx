"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { FaRegEdit } from "react-icons/fa";
import type { OrderWithItems } from "../types/order.type";
import { useGetOrder } from "../hooks/use-orders";
import { OrderItemsCard } from "./order-items-card";
import { OrderAddressCard } from "./order-address-card";
import { OrderActionsCard } from "./order-actions-card";
import { OrderAuditCard } from "./order-audit-card";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { AddManualOrderItemsModal } from "./add-manual-order-items-modal";
import { useManualOrders } from "../hooks/use-manual-orders";

function StatusBadge({ status }: { status: OrderWithItems["status"] }) {
  if (status === "paid") return <Badge>Paid</Badge>;
  if (status === "fulfilled") return <Badge>Fulfilled</Badge>;
  if (status === "cancelled")
    return <Badge variant="secondary">Cancelled</Badge>;
  return <Badge variant="secondary">On hold</Badge>;
}

export default function OrderDetailsClient({ orderId }: { orderId: string }) {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { data, isLoading } = useGetOrder(session, axios, orderId);
  const [isOpen, setIsOpen] = useState(false);
  const { createManualPayment } = useManualOrders(orderId);

  if (authStatus === "loading" || isLoading) return <Loading />;
  if (!data) return null;

  const order = data;

  // ✅ fallback: if billing is null, use shipping
  const billingOrShipping = order.billingAddress ?? order.shippingAddress;

  const handleCreateManualPayment = () => {
    createManualPayment();
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description="Order details and actions."
        tooltip="On hold = pending payment. Completed = fulfilled."
      >
        {order.channel === "manual" &&
          order.status !== "pending_payment" &&
          order.status !== "paid" && (
            <>
              <Button onClick={() => setIsOpen(true)}>
                <FaRegEdit />
                Add Item
              </Button>
              <Button onClick={() => handleCreateManualPayment()}>
                Submit For Payment
              </Button>
            </>
          )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Order summary */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">Order summary</CardTitle>
              </div>
              <StatusBadge status={order.status} />
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Channel</div>
                  <div className="text-sm">{order.channel ?? "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Delivery</div>
                  <div className="text-sm">
                    {order.deliveryMethodType ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Method</div>
                  <div className="text-sm">
                    {order.shippingMethodLabel ?? "—"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="text-sm">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-sm">
                    {formatMoneyNGN(order.subtotal, order.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Shipping
                  </span>
                  <span className="text-sm">
                    {formatMoneyNGN(order.shippingTotal, order.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm">
                    {formatMoneyNGN(order.taxTotal, order.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Discount
                  </span>
                  <span className="text-sm">
                    {formatMoneyNGN(order.discountTotal, order.currency)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-base font-semibold">
                  {formatMoneyNGN(order.total, order.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid gap-6 md:grid-cols-2">
            <OrderAddressCard
              title="Shipping address"
              address={order.shippingAddress}
            />
            <OrderAddressCard
              title="Billing address"
              address={billingOrShipping}
            />
          </div>

          {/* Items w/ images */}
          <OrderItemsCard currency={order.currency} items={order.items ?? []} />
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <OrderActionsCard order={order} session={session} axios={axios} />
          <OrderAuditCard events={order.events ?? []} />

          {/* Placeholder */}
        </div>
      </div>

      <AddManualOrderItemsModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={order.id}
        currency={order.currency}
        rows={[]}
      />
    </section>
  );
}
