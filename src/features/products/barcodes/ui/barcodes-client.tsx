/* eslint-disable @typescript-eslint/no-explicit-any */
// features/products/barcodes/ui/barcodes-client.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Barcode, Printer, RefreshCw, AlertTriangle } from "lucide-react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import {
  useBulkGenerateForStore,
  useGenerateLabelsPdf,
} from "../hooks/use-barcodes";
import { toast } from "sonner";

type RunResult = {
  total: number;
  skipped: number;
  succeeded: number;
  failed: number;
  results: {
    variantId: string;
    barcode: string;
    barcodeImageUrl: string;
    storageKey: string;
  }[];
  errors: { variantId: string; error: string }[];
};
export function BarcodesClient() {
  const { activeStoreId } = useStoreScope();
  const bulkGenerate = useBulkGenerateForStore();
  const generatePdf = useGenerateLabelsPdf();
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [showRegenWarning, setShowRegenWarning] = useState(false);

  const handleGenerateMissing = async () => {
    if (!activeStoreId) return;
    try {
      const result = await bulkGenerate.mutateAsync({
        storeId: activeStoreId,
        skipExisting: true,
      });
      setLastResult(result);
      toast.success(
        `Done — ${result.succeeded} generated, ${result.skipped} already had barcodes`,
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate barcodes");
    }
  };

  const handleRegenerateAll = async () => {
    if (!activeStoreId) return;
    setShowRegenWarning(false);
    try {
      const result = await bulkGenerate.mutateAsync({
        storeId: activeStoreId,
        skipExisting: false,
      });
      setLastResult(result);
      toast.success(`Done — ${result.succeeded} barcodes regenerated`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to regenerate barcodes");
    }
  };

  const handlePrintAll = async () => {
    if (!lastResult?.results?.length) {
      toast.error("Generate barcodes first before printing");
      return;
    }
    try {
      const variantIds = lastResult.results.map((r) => r.variantId);
      const pdf = await generatePdf.mutateAsync({ variantIds });
      window.open(pdf.pdfUrl, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Barcode Management</h2>
        <p className="text-sm text-muted-foreground">
          Generate and print barcodes for all variants in this store.
        </p>
      </div>

      {/* Actions */}
      <div className="rounded-lg border p-6 space-y-4">
        <h3 className="text-sm font-semibold">Store-wide actions</h3>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            onClick={handleGenerateMissing}
            disabled={bulkGenerate.isPending || !activeStoreId}
            isLoading={bulkGenerate.isPending}
          >
            <Barcode className="h-4 w-4 mr-2" />
            Generate Missing Barcodes
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowRegenWarning(true)}
            disabled={bulkGenerate.isPending || !activeStoreId}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate All
          </Button>

          <Button
            variant="outline"
            onClick={handlePrintAll}
            disabled={generatePdf.isPending || !lastResult?.results?.length}
            isLoading={generatePdf.isPending}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Labels
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          <strong>Generate Missing</strong> — only creates barcodes for variants
          that don&apos;t have one yet. Safe to run anytime.
          <br />
          <strong>Regenerate All</strong> — overwrites existing barcodes. Use
          with caution.
        </p>
      </div>

      {/* Regen warning */}
      {showRegenWarning && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-semibold">
              This will overwrite all existing barcodes
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Any previously printed labels will no longer scan correctly. Are you
            sure?
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRegenerateAll}
              disabled={bulkGenerate.isPending}
            >
              Yes, regenerate all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRegenWarning(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Last run result */}
      {lastResult && (
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-sm font-semibold">Last run results</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total variants" value={lastResult.total} />
            <StatCard
              label="Generated"
              value={lastResult.succeeded}
              color="text-green-600"
            />
            <StatCard
              label="Skipped"
              value={lastResult.skipped ?? 0}
              color="text-muted-foreground"
            />
            <StatCard
              label="Failed"
              value={lastResult.failed}
              color={lastResult.failed > 0 ? "text-destructive" : undefined}
            />
          </div>

          {lastResult.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-destructive">Errors:</p>
              {lastResult.errors.map((e) => (
                <p key={e.variantId} className="text-xs text-destructive">
                  {e.variantId}: {e.error}
                </p>
              ))}
            </div>
          )}

          {lastResult.succeeded > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAll}
              disabled={generatePdf.isPending}
              isLoading={generatePdf.isPending}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print labels for this run ({lastResult.succeeded})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-md border p-3 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color ?? "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
