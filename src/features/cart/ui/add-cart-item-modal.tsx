"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { useGetProductFull } from "@/features/products/core/hooks/use-product";
import { ProductCombobox } from "@/features/products/core/ui/combobox/product-combo-box";
import { VariantCombobox } from "@/features/products/core/ui/combobox/variant-combo-box";
import { FullProduct } from "@/features/products/types/product.type";

type ProductListItem = { id: string; name: string };

export function AddCartItemModal({
  open,
  onClose,
  cartId,
  products,
}: {
  open: boolean;
  onClose: () => void;
  cartId: string;
  products: ProductListItem[];
}) {
  const { data: session } = useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const reset = () => {
    setProductId(null);
    setVariantId(null);
    setQty(1);
  };

  const { data: fullProduct, isLoading: fullLoading } = useGetProductFull(
    productId,
    session
  );

  const variations = useMemo(() => {
    return ((fullProduct as FullProduct | undefined)?.variations ?? []).filter(
      Boolean
    );
  }, [fullProduct]);

  const hasVariations = variations.length > 0;

  const productOptions = useMemo(
    () => products.map((p) => ({ id: p.id, label: p.name, product: p })),
    [products]
  );

  const variationOptions = useMemo(() => {
    return variations.map((v) => {
      const attrs = (v.attributes ?? [])
        .map((a) => `${a.name}: ${a.option}`)
        .join(" · ");

      const pricePart = v.price ? ` — ${v.price}` : "";

      const imageSrc =
        v.image?.src ??
        v.images?.[0]?.src ??
        fullProduct?.images?.[0]?.src ??
        null;

      return {
        id: v.id,
        label: `${attrs || "Default"}${pricePart}`,
        imageSrc, // ✅ send it
      };
    });
  }, [variations, fullProduct]);

  const handleProductChange = (id: string | null) => {
    setProductId(id);
    setVariantId(null); // reset when switching products
  };

  // ✅ auto-select if only 1 variation
  const autoSelectSingleVariation = useEffectEvent(
    (vars: Array<{ id: string }>) => {
      if (vars.length === 1) setVariantId(vars[0].id);
    }
  );

  useEffect(() => {
    autoSelectSingleVariation(variations);
  }, [variations]);

  const addItem = useCreateMutation({
    endpoint: `/api/carts/${cartId}/items`,
    successMessage: "Item added to cart",
    refetchKey: "carts list details items",
  });

  const canSubmit = !!productId && qty >= 1 && (!hasVariations || !!variantId);

  console.log(variationOptions);

  const submit = () => {
    if (!canSubmit) return;
    setSubmitError(null);
    addItem({ productId, variantId, quantity: qty }, setSubmitError, () => {
      onClose();
      reset();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
          reset();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add item to cart</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <ProductCombobox
            value={productId}
            onChange={handleProductChange}
            options={productOptions}
          />

          {productId && hasVariations ? (
            <VariantCombobox
              value={variantId}
              onChange={setVariantId}
              options={variationOptions}
              disabled={fullLoading}
              placeholder={
                fullLoading ? "Loading variants…" : "Select a variation"
              }
            />
          ) : null}

          <Input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </div>
        {submitError ? (
          <p className="mt-4 text-sm text-red-600">{submitError}</p>
        ) : null}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              reset();
            }}
          >
            Cancel
          </Button>

          <Button disabled={!canSubmit} onClick={submit}>
            Add to cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
