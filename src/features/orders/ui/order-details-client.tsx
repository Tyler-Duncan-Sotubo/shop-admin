"use client";

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
import { AddManualOrderItemsSheet } from "./add-manual-order-items-modal";
import { useManualOrders } from "../hooks/use-manual-orders";
import { EditOrderCustomerShippingModal } from "./edit-order-customer-shipping-modal";
import { StockWarning } from "./stock-warning";
import { useAuthPermissions } from "@/lib/auth/use-permissions";
import { useOrderPermissions } from "../hooks/use-order-permissions";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { ApplyDiscountSheet } from "./apply-discount-modal";
import { BackButton } from "@/shared/ui/back-button";
import { EditShippingFeeModal } from "./edit-shipping-fee-modal";
import { InvoicePaymentsAccordion } from "@/features/billing/payments/ui/invoice-payments-accordion";
import { isEnterprisePlan } from "@/features/subscription/config/plan-tier";
import { useGetMySubscription } from "@/features/subscription/hooks/use-subscriptions";

function StatusBadge({ status }: { status: OrderWithItems["status"] }) {
  if (status === "paid") return <Badge>Paid</Badge>;
  if (status === "awaiting_dispatch")
    return <Badge variant="pending">Awaiting Dispatch</Badge>;
  if (status === "fulfilled") return <Badge>Fulfilled</Badge>;
  if (status === "lay_buy") return <Badge variant="pending">Lay-buy</Badge>;
  if (status === "refunded")
    return <Badge variant="destructive">Refunded</Badge>;
  if (status === "cancelled")
    return <Badge variant="secondary">Cancelled</Badge>;
  return <Badge variant="secondary">On hold</Badge>;
}

export default function OrderDetailsClient({ orderId }: { orderId: string }) {
  const { permissions, session, status: authStatus } = useAuthPermissions();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editCustomerShippingOpen, setEditCustomerShippingOpen] =
    useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  const { data, isLoading } = useGetOrder(session, axios, orderId);

  const { canRead, canUpdate } = useOrderPermissions(permissions);

  // Derive canCheckStock safely — data may still be undefined here,
  // so we use optional chaining. The hook itself gates on the boolean.
  const canCheckStock =
    canRead &&
    !!data &&
    data.channel !== "online" &&
    data.status !== "fulfilled" &&
    data.status !== "cancelled";

  // All hooks must be called unconditionally before any early return
  const { data: subscription } = useGetMySubscription(session, axios);
  const isEnterprise = isEnterprisePlan(subscription?.plan.name);

  const { createManualPayment, stockCheck } = useManualOrders(
    orderId,
    data?.status === "pending_payment" ? "Invoice synced" : "Invoice created",
    canCheckStock,
  );

  // Early returns after all hooks
  if (authStatus === "loading" || isLoading) return <Loading />;
  if (!data) return null;

  const order = data;
  const billingOrShipping = order.billingAddress ?? order.shippingAddress;
  const insufficientItems =
    stockCheck.data?.items.filter((i) => !i.sufficient) ?? [];

  const isLocked = ["fulfilled", "cancelled", "refunded"].includes(
    order.status,
  );

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
      <BackButton href="/sales/orders" label="Back to orders" />

      <PageHeader
        title={`Order ${order.orderNumber}`}
        description="Order details and actions."
        tooltip="On hold = pending payment. Completed = fulfilled."
      >
        {order.channel !== "online" && !isLocked && (
          <div className="flex flex-wrap gap-2">
            {(order.sourceType === "manual" ||
              order.sourceType === "quote") && (
              <Button onClick={() => setIsOpen(true)} variant="clean" size="sm">
                <FaRegEdit />
                Add Item
              </Button>
            )}

            <Button
              onClick={() => setDiscountOpen(true)}
              variant="clean"
              size="sm"
            >
              Discount
            </Button>

            <Button
              onClick={() => setShippingOpen(true)}
              variant="clean"
              size="sm"
            >
              Shipping
            </Button>

            {order.status === "pending_payment" && (
              <Button
                onClick={handleCreateManualPayment}
                variant="clean"
                size="sm"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Sync Invoice
              </Button>
            )}
          </div>
        )}
        {isLocked && (
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            This order is{" "}
            <span className="font-medium uppercase">{order.status}</span> and
            can no longer be modified.
          </div>
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
              canUpdate={canUpdate && !isLocked}
            />

            <OrderAddressCard
              title="Billing address"
              address={billingOrShipping}
              editable
              onEdit={() => setEditCustomerShippingOpen(true)}
              canUpdate={canUpdate && !isLocked}
            />
          </div>

          <OrderItemsCard
            currency={order.currency}
            items={order.items ?? []}
            orderId={order.id}
            isLocked={isLocked}
          />
        </div>

        <div className="space-y-6">
          <StockWarning
            insufficientItems={insufficientItems}
            fulfillmentModel={stockCheck.data?.fulfillmentModel}
          />
          {!isLocked && (
            <OrderActionsCard
              order={order}
              session={session}
              axios={axios}
              canUpdate={canUpdate}
              storeId={activeStoreId as string}
            />
          )}
          {!isEnterprise && (
            <InvoicePaymentsAccordion
              orderId={order.id}
              summaryOnlyConfirmed={false}
              title="Payments recorded"
            />
          )}
          <OrderAuditCard events={order.events ?? []} />
        </div>
      </div>

      <AddManualOrderItemsSheet
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

      <ApplyDiscountSheet
        open={discountOpen}
        onClose={() => setDiscountOpen(false)}
        orderId={order.id}
        subtotal={order.subtotal as string | number}
        currency={order.currency}
        currentDiscount={order.discountTotal}
      />

      <EditShippingFeeModal
        open={shippingOpen}
        onClose={() => setShippingOpen(false)}
        orderId={order.id}
        currentShipping={order.shippingTotal}
        currency={order.currency}
      />
    </section>
  );
}
