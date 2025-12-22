"use client";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function InvoicePreviewPane({
  html,
  loading,
  error,
  onDownloadPdf,
  downloading,
}: {
  html: string;
  loading?: boolean;
  error?: string | null;
  onDownloadPdf: () => Promise<void>;
  downloading?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Preview</p>
          <p className="text-xs text-muted-foreground">
            HTML preview matches PDF output.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={onDownloadPdf}
          disabled={!!downloading}
        >
          {downloading ? "Preparing..." : "Download PDF"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border p-4">
          <p className="text-sm font-semibold text-red-600">Preview failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : loading ? (
        <Skeleton className="min-h-[70vh] w-full" />
      ) : (
        <iframe
          title="Invoice preview"
          className="min-h-[800px] w-full rounded-md border bg-white"
          srcDoc={html}
          sandbox="allow-same-origin"
        />
      )}
    </Card>
  );
}
