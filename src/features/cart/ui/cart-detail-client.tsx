/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useGetCart } from "../hooks/use-carts";
import { CartItemsTable } from "./cart-items-table";
import { AddCartItemModal } from "./add-cart-item-modal";
import { useGetProducts } from "@/features/products/core/hooks/use-product";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

type ModalProduct = {
  id: string;
  name: string;
  variants?: { id: string; title: string; price: string }[];
};

export default function CartDetailClient({ cartId }: { cartId: string }) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [addOpen, setAddOpen] = useState(false);

  const { data: cart, isLoading, error } = useGetCart(cartId, session, axios);

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useGetProducts({ limit: 200, offset: 0 }, session);

  const modalProducts: ModalProduct[] = useMemo(() => {
    const list = products ?? [];
    return list.map((p: any) => ({
      id: p.id,
      name: p.name ?? p.title ?? "Untitled",
      variants: (p.variants ?? []).map((v: any) => {
        const raw =
          v.price ?? v.calculatedPrice ?? v.amount ?? v.regular_price ?? "";

        return {
          id: v.id,
          title: v.title ?? v.name ?? "Default",
          // ✅ format for display in modal (if used)
          price: raw !== "" ? formatMoneyNGN(raw) : "",
        };
      }),
    }));
  }, [products]);

  if (isLoading) return <Loading />;

  if (error || !cart) {
    return (
      <EmptyState
        title="Failed to load cart"
        description="Cart could not be loaded."
        secondaryAction={{
          label: "Retry",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={`Cart #${cart.cartId}`}
          description="View cart items and totals."
        />

        <Button
          onClick={() => setAddOpen(true)}
          disabled={productsLoading || !!productsError}
        >
          Add item
        </Button>
      </div>

      <AddCartItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        cartId={cartId}
        products={modalProducts}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="outline" className="capitalize">
              {cart.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatMoneyNGN(cart.subtotal)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Shipping</span>
            <span className="font-medium">
              {formatMoneyNGN(cart.shippingTotal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-semibold">{formatMoneyNGN(cart.total)}</span>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            Method: {cart.selectedShippingMethodLabel ?? "—"}
          </div>
        </div>
      </div>

      <CartItemsTable data={cart.items ?? []} />
    </section>
  );
}
