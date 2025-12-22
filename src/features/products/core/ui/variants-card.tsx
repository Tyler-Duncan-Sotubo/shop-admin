"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { ProductVariant } from "../api/product-variants.api";
import { useProductVariants } from "../hooks/use-product-variants";
import { VariantEditDialog } from "./variant-edit-dialog";
import { DeleteIconDialog } from "@/shared/ui/delete-dialog-icon";

function variantLabel(v: ProductVariant) {
  const parts = [v.option1, v.option2, v.option3].filter(Boolean);
  if (parts.length) return parts.join(" - ");
  return v.title ?? "Default variant";
}

function getSizeOption(v: ProductVariant) {
  // In your data, option2 is the "size" (Hand, Face, Bath, Bath Sheet)
  return v.option2 ?? "";
}

export function VariantsCard({ productId }: { productId: string }) {
  const { variants, isLoading } = useProductVariants(productId);
  const [editing, setEditing] = useState<ProductVariant | null>(null);

  const groupedBySize = useMemo(() => {
    const map = new Map<string, ProductVariant[]>();

    for (const v of variants) {
      const size = (getSizeOption(v) || "").trim();
      const list = map.get(size) ?? [];
      list.push(v);
      map.set(size, list);
    }

    // sort: groups by size A→Z, variants inside each group by option1 (color)
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([size, list]) => ({
        size,
        variants: list.sort((x, y) =>
          (x.option1 ?? "").localeCompare(y.option1 ?? "")
        ),
      }));
  }, [variants]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-medium">Variants</h2>
        <p className="text-sm text-muted-foreground">
          Edit SKU, pricing, and activation per variant.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : variants.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No variants yet. Add option values then click “Generate variants”.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedBySize.map((group) => (
            <div key={group.size} className="overflow-auto rounded-md border">
              <div className="px-3 py-2 text-sm font-medium bg-muted/40">
                Size: {group.size}
              </div>

              <table className="w-full text-sm">
                <thead className="bg-muted/20">
                  <tr className="text-left">
                    <th className="p-2">Variant</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {group.variants.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="p-2">
                        <div className="font-medium">{variantLabel(v)}</div>
                      </td>

                      <td className="p-2 pr-4">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setEditing(v)}
                            className="px-2"
                          >
                            Edit
                          </Button>

                          <DeleteIconDialog
                            endpoint={`/api/catalog/variants/${v.id}`}
                            title="Delete variant"
                            description="Are you sure you want to delete this variant? This action cannot be undone."
                            refetchKey="product-variants"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <VariantEditDialog
        open={!!editing}
        variant={editing}
        productId={productId}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
