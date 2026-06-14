/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { ProductVariant } from "../api/product-variants.api";
import { useProductVariants } from "../hooks/use-product-variants";
import { VariantEditDialog } from "./variant-edit-dialog";
import { DeleteIconDialog } from "@/shared/ui/delete-dialog-icon";
import {
  useGenerateBarcodeForVariant,
  useBulkGenerateForProduct,
  useGenerateLabelsPdf,
} from "../../barcodes/hooks/use-barcodes";
import { Barcode, Printer, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

function variantLabel(v: ProductVariant) {
  const parts = [v.option1, v.option2, v.option3].filter(Boolean);
  if (parts.length) return parts.join(" - ");
  return v.title ?? "Default variant";
}

function getSizeOption(v: ProductVariant) {
  return v.option2 ?? "";
}

export function VariantsCard({ productId }: { productId: string }) {
  const { variants, isLoading } = useProductVariants(productId);
  const [editing, setEditing] = useState<ProductVariant | null>(null);

  const generateOne = useGenerateBarcodeForVariant();
  const generateAll = useBulkGenerateForProduct();
  const generatePdf = useGenerateLabelsPdf();

  const groupedBySize = useMemo(() => {
    const map = new Map<string, ProductVariant[]>();
    for (const v of variants) {
      const size = (getSizeOption(v) || "").trim();
      const list = map.get(size) ?? [];
      list.push(v);
      map.set(size, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([size, list]) => ({
        size,
        variants: list.sort((x, y) =>
          (x.option1 ?? "").localeCompare(y.option1 ?? ""),
        ),
      }));
  }, [variants]);

  const handleGenerateAll = async () => {
    try {
      const result = await generateAll.mutateAsync({ productId });
      toast.success(
        `Generated ${result.succeeded} barcode${result.succeeded !== 1 ? "s" : ""}${result.failed > 0 ? `, ${result.failed} failed` : ""}`,
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate barcodes");
    }
  };

  const handleGenerateOne = async (variantId: string) => {
    try {
      await generateOne.mutateAsync({ variantId });
      toast.success("Barcode generated");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate barcode");
    }
  };

  const handlePrintLabels = async () => {
    const variantIds = variants.map((v) => v.id);
    try {
      const result = await generatePdf.mutateAsync({ variantIds });
      window.open(result.pdfUrl, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate labels PDF");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-medium">Variants</h2>
          <p className="text-sm text-muted-foreground">
            Edit SKU, pricing, and activation per variant.
          </p>
        </div>

        {variants.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintLabels}
              disabled={generatePdf.isPending}
            >
              {generatePdf.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Printer className="h-3.5 w-3.5" />
              )}
              Print Labels
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateAll}
              disabled={generateAll.isPending}
            >
              {generateAll.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Barcode className="h-3.5 w-3.5" />
              )}
              Generate All Barcodes
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : variants.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No variants yet. Add option values then click &quot;Generate
          variants&quot;.
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
                    <th className="p-2">Barcode</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {group.variants.map((v) => {
                    const anyV = v as any;
                    const hasBarcode = !!anyV.barcode?.trim();
                    const barcodeImageUrl = anyV.barcodeImageUrl ?? null;
                    const isGenerating =
                      generateOne.isPending &&
                      generateOne.variables?.variantId === v.id;

                    return (
                      <tr key={v.id} className="border-t">
                        <td className="p-2">
                          <div className="font-medium">{variantLabel(v)}</div>
                          {v.sku && (
                            <div className="text-xs text-muted-foreground">
                              SKU: {v.sku}
                            </div>
                          )}
                        </td>

                        <td className="p-2">
                          {barcodeImageUrl ? (
                            <div className="flex items-center gap-2">
                              <Image
                                src={barcodeImageUrl}
                                alt={anyV.barcode ?? "barcode"}
                                width={80}
                                height={32}
                                className="object-contain"
                              />
                              <span className="text-xs text-muted-foreground font-mono">
                                {anyV.barcode}
                              </span>
                            </div>
                          ) : hasBarcode ? (
                            <span className="text-xs text-muted-foreground font-mono">
                              {anyV.barcode}
                            </span>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground"
                              onClick={() => handleGenerateOne(v.id)}
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Barcode className="h-3 w-3 mr-1" />
                              )}
                              Generate
                            </Button>
                          )}
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
                    );
                  })}
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
