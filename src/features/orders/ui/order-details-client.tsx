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
import { EditOrderCustomerShippingModal } from "./edit-order-customer-shipping-modal";
import { StockWarning } from "./stock-warning";

function StatusBadge({ status }: { status: OrderWithItems["status"] }) {
  if (status === "paid") return <Badge>Paid</Badge>;
  if (status === "fulfilled") return <Badge>Fulfilled</Badge>;
  if (status === "lay_buy") return <Badge variant="pending">Lay-buy</Badge>;
  if (status === "cancelled")
    return <Badge variant="secondary">Cancelled</Badge>;
  return <Badge variant="secondary">On hold</Badge>;
}

export default function OrderDetailsClient({ orderId }: { orderId: string }) {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { data, isLoading } = useGetOrder(session, axios, orderId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [editCustomerShippingOpen, setEditCustomerShippingOpen] =
    useState(false);

  const { createManualPayment, stockCheck } = useManualOrders(
    orderId,
    data?.status === "pending_payment" ? "Invoice synced" : "Invoice created",
  );

  const insufficientItems =
    stockCheck.data?.items.filter((i) => !i.sufficient) ?? [];

  if (authStatus === "loading" || isLoading) return <Loading />;
  if (!data) return null;

  const order = data;
  const billingOrShipping = order.billingAddress ?? order.shippingAddress;

  const handleCreateManualPayment = () => {
    try {
      setIsSubmitting(true);
      createManualPayment();
    } catch (error) {
      console.error("Error creating manual payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description="Order details and actions."
        tooltip="On hold = pending payment. Completed = fulfilled."
      >
        {order.channel === "manual" &&
          order.status !== "paid" &&
          order.status !== "fulfilled" &&
          order.status !== "cancelled" && (
            <>
              {(order.sourceType === "manual" ||
                order.sourceType === "quote") && (
                <Button onClick={() => setIsOpen(true)} variant="clean">
                  <FaRegEdit />
                  Add Item
                </Button>
              )}

              {order.status === "draft" && (
                <Button onClick={handleCreateManualPayment} variant="clean">
                  Convert to Invoice
                </Button>
              )}

              {order.status === "pending_payment" && (
                <Button
                  onClick={handleCreateManualPayment}
                  variant="clean"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Sync Invoice
                </Button>
              )}
            </>
          )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
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

          <div className="grid gap-6 md:grid-cols-2">
            <OrderAddressCard
              title="Shipping address"
              address={order.shippingAddress}
              editable
              onEdit={() => setEditCustomerShippingOpen(true)}
            />

            <OrderAddressCard
              title="Billing address"
              address={billingOrShipping}
              editable
              onEdit={() => setEditCustomerShippingOpen(true)}
            />
          </div>

          <OrderItemsCard currency={order.currency} items={order.items ?? []} />
        </div>

        <div className="space-y-6">
          <StockWarning
            insufficientItems={insufficientItems}
            fulfillmentModel={stockCheck.data?.fulfillmentModel}
          />
          <OrderActionsCard order={order} session={session} axios={axios} />
          <OrderAuditCard events={order.events ?? []} />
        </div>
      </div>

      <AddManualOrderItemsModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        orderId={order.id}
        currency={order.currency}
        rows={[]}
      />

      <EditOrderCustomerShippingModal
        open={editCustomerShippingOpen}
        onClose={() => setEditCustomerShippingOpen(false)}
        orderId={order.id}
        storeId={order.storeId ?? null}
      />
    </section>
  );
}
